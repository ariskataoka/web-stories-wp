/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * External dependencies
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useVirtual } from 'react-virtual';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { trackEvent } from '@web-stories-wp/tracking';
import { __ } from '@web-stories-wp/i18n';

/**
 * Internal dependencies
 */
import { useStory } from '../../../../app';
import { duplicatePage } from '../../../../elements';

import { UnitsProvider } from '../../../../units';
import isDefaultPage from '../../../../utils/isDefaultPage';
import { PANE_PADDING } from '../shared';
import {
  getVirtualizedItemIndex,
  useVirtualizedGridNavigation,
  VirtualizedContainer,
  PANEL_GRID_ROW_GAP,
  VirtualizedWrapper,
} from '../shared/virtualizedPanelGrid';
import {
  Headline,
  Text,
  THEME_CONSTANTS,
  Toggle,
} from '../../../../../design-system';
import PageTemplate from './pageTemplate';
import ConfirmPageTemplateDialog from './confirmPageTemplateDialog';

const ActionRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 8px 16px 22px 16px;
`;

const TemplatesToggle = styled.div`
  display: flex;

  label {
    cursor: pointer;
    margin: auto 12px;
    color: ${({ theme }) => theme.colors.fg.secondary};
  }
`;

function PageTemplates({
  onToggleClick,
  pages,
  parentRef,
  showTemplateImages,
  pageSize,
}) {
  const { replaceCurrentPage, currentPage } = useStory(
    ({ actions: { replaceCurrentPage }, state: { currentPage } }) => ({
      replaceCurrentPage,
      currentPage,
    })
  );

  const containerRef = useRef();
  const pageRefs = useRef({});
  const toggleId = useMemo(() => `toggle_page_templates_${uuidv4()}`, []);

  const [selectedPage, setSelectedPage] = useState();
  const [isConfirming, setIsConfirming] = useState();

  const pageIds = useMemo(() => pages.map((page) => page.id), [pages]);

  const requiresConfirmation = useMemo(
    () => currentPage && !isDefaultPage(currentPage),
    [currentPage]
  );

  const handleApplyPageTemplate = useCallback(
    (page) => {
      const duplicatedPage = duplicatePage(page);
      replaceCurrentPage({ page: duplicatedPage });
      trackEvent('insert_page_template', {
        name: page.title,
      });

      setSelectedPage(null);
    },
    [replaceCurrentPage]
  );

  const handlePageClick = useCallback(
    (page) => {
      if (requiresConfirmation) {
        setIsConfirming(true);
        setSelectedPage(page);
      } else {
        handleApplyPageTemplate(page);
        setSelectedPage(null);
      }
    },
    [requiresConfirmation, handleApplyPageTemplate]
  );

  const handleCloseDialog = useCallback(() => {
    setSelectedPage(null);
    setIsConfirming(false);
  }, [setIsConfirming]);

  const handleConfirmDialog = useCallback(() => {
    handleApplyPageTemplate(selectedPage);
    setIsConfirming(false);
  }, [selectedPage, handleApplyPageTemplate]);

  const rowVirtualizer = useVirtual({
    size: Math.ceil((pages || []).length / 2),
    parentRef,
    estimateSize: useCallback(
      () => pageSize.containerHeight + PANEL_GRID_ROW_GAP,
      [pageSize.containerHeight]
    ),
    overscan: 4,
  });

  const columnVirtualizer = useVirtual({
    horizontal: true,
    size: 2,
    parentRef,
    estimateSize: useCallback(() => pageSize.width + PANEL_GRID_ROW_GAP, [
      pageSize.width,
    ]),
    overscan: 0,
  });

  const {
    activeGridItemId,
    handleGridFocus,
    handleGridItemFocus,
    isGridFocused,
  } = useVirtualizedGridNavigation({
    rowVirtualizer,
    containerRef,
    gridItemRefs: pageRefs,
    gridItemIds: pageIds,
  });

  const handleKeyboardPageClick = useCallback(
    ({ key }, page) => {
      if (key === 'Enter') {
        if (isGridFocused) {
          handlePageClick(page);
        }
      }
    },
    [isGridFocused, handlePageClick]
  );

  return (
    <UnitsProvider
      pageSize={{
        width: pageSize.width,
        height: pageSize.height,
      }}
    >
      <ActionRow>
        <Headline
          as="h3"
          size={THEME_CONSTANTS.TYPOGRAPHY.PRESET_SIZES.XXX_SMALL}
        >
          {__('Templates', 'web-stories')}
        </Headline>
        <TemplatesToggle>
          <Text
            as="label"
            htmlFor={toggleId}
            size={THEME_CONSTANTS.TYPOGRAPHY.PRESET_SIZES.SMALL}
          >
            {__('Show Images', 'web-stories')}
          </Text>
          <Toggle
            id={toggleId}
            name={toggleId}
            checked={showTemplateImages}
            onChange={onToggleClick}
          />
        </TemplatesToggle>
      </ActionRow>
      <VirtualizedWrapper height={rowVirtualizer.totalSize}>
        <VirtualizedContainer
          height={rowVirtualizer.totalSize}
          ref={containerRef}
          columnWidth={pageSize.width}
          rowHeight={pageSize.containerHeight}
          paneLeft={PANE_PADDING}
          onFocus={handleGridFocus}
          role="list"
          aria-label={__('Page Template Options', 'web-stories')}
        >
          {rowVirtualizer.virtualItems.map((virtualRow) =>
            columnVirtualizer.virtualItems.map((virtualColumn) => {
              const pageIndex = getVirtualizedItemIndex({
                columnIndex: virtualColumn.index,
                rowIndex: virtualRow.index,
              });

              const page = pages[pageIndex];

              if (!page) {
                return null;
              }
              const isActive = activeGridItemId === page.id && isGridFocused;

              return (
                <PageTemplate
                  key={pageIndex}
                  data-testid={`page_template_${page.id}`}
                  ref={(el) => (pageRefs.current[page.id] = el)}
                  translateY={virtualRow.start}
                  translateX={virtualColumn.start}
                  page={page}
                  pageSize={pageSize}
                  isActive={isActive}
                  onFocus={() => handleGridItemFocus(page.id)}
                  onClick={() => handlePageClick(page)}
                  onKeyUp={(event) => handleKeyboardPageClick(event, page)}
                />
              );
            })
          )}
        </VirtualizedContainer>
        {isConfirming && (
          <ConfirmPageTemplateDialog
            onConfirm={handleConfirmDialog}
            onClose={handleCloseDialog}
          />
        )}
      </VirtualizedWrapper>
    </UnitsProvider>
  );
}

PageTemplates.propTypes = {
  onToggleClick: PropTypes.func.isRequired,
  parentRef: PropTypes.object.isRequired,
  pages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
    })
  ),
  showTemplateImages: PropTypes.bool,
  pageSize: PropTypes.object.isRequired,
};

export default PageTemplates;
