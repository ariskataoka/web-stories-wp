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
import { useCallback, useState, useEffect, useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';
/**
 * Internal dependencies
 */
import { useStory } from '../../../app';
import {
  getPrepublishErrors,
  PRE_PUBLISH_MESSAGE_TYPES,
} from '../../../app/prepublish';
import usePrevious from '../../../../design-system/utils/usePrevious';
import { useLayout } from '../../../app/layout';
import Context from './context';
import {
  checkpointReducer,
  PPC_CHECKPOINT_STATE,
  PPC_CHECKPOINT_ACTION,
} from './prepublishCheckpointState';

function PrepublishChecklistProvider({ children }) {
  const pageSize = useLayout(({ state: { pageWidth, pageHeight } }) => ({
    width: pageWidth,
    height: pageHeight,
  }));

  const story = useStory(({ state: { story, pages } }) => {
    return { ...story, pages };
  });

  const [currentList, setCurrentList] = useState([]);
  const [isChecklistReviewRequested, setIsChecklistReviewRequested] = useState(
    false
  );
  const [isHighPriorityEmpty, setIsHighPriorityEmpty] = useState(false);

  const handleRefreshList = useCallback(async () => {
    const pagesWithSize = story.pages.map((page) => ({
      ...page,
      pageSize,
    }));
    setCurrentList(
      await getPrepublishErrors({ ...story, pages: pagesWithSize })
    );
  }, [story, pageSize]);

  const prevPages = usePrevious(story.pages);
  const prevPageSize = usePrevious(pageSize);

  const refreshOnInitialLoad = prevPages?.length === 0 && story.pages?.length;
  const refreshOnPageSizeChange = prevPageSize?.width !== pageSize?.width;

  useEffect(() => {
    if (refreshOnInitialLoad || refreshOnPageSizeChange) {
      handleRefreshList();
    }
  }, [handleRefreshList, refreshOnInitialLoad, refreshOnPageSizeChange]);

  const [checkpointState, dispatch] = useReducer(
    checkpointReducer,
    PPC_CHECKPOINT_STATE.UNAVAILABLE
  );

  const highPriorityLength = useMemo(
    () =>
      currentList.filter(
        (current) => current.type === PRE_PUBLISH_MESSAGE_TYPES.ERROR
      ).length,
    [currentList]
  );

  // this will prevent the review dialog from getting triggered again
  useEffect(() => {
    if (
      checkpointState === PPC_CHECKPOINT_STATE.ALL &&
      highPriorityLength === 0
    ) {
      setIsHighPriorityEmpty(true);
    }
  }, [checkpointState, highPriorityLength]);

  const focusChecklistTab = useCallback(() => {
    dispatch(PPC_CHECKPOINT_ACTION.ON_PUBLISH_CLICKED);
    setIsChecklistReviewRequested(true);
  }, [setIsChecklistReviewRequested]);

  // Use this when a published story gets turned back to a draft.
  const resetReviewDialogTrigger = useCallback(() => {
    setIsChecklistReviewRequested(false);
  }, []);

  // Review dialog should be seen when there are high priority items and first publish still hasn't happened.
  const shouldReviewDialogBeSeen = useMemo(
    () => !isHighPriorityEmpty && !isChecklistReviewRequested,
    [isChecklistReviewRequested, isHighPriorityEmpty]
  );

  return (
    <Context.Provider
      value={{
        checklist: currentList,
        refreshChecklist: handleRefreshList,
        currentCheckpoint: checkpointState,
        isChecklistReviewRequested,
        focusChecklistTab,
        resetReviewDialogTrigger,
        isHighPriorityEmpty,
        shouldReviewDialogBeSeen,
      }}
    >
      {children}
    </Context.Provider>
  );
}

PrepublishChecklistProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default PrepublishChecklistProvider;
