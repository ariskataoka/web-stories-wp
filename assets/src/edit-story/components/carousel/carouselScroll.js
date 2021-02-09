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
import PropTypes from 'prop-types';
import { __ } from '@web-stories-wp/i18n';
import styled from 'styled-components';

/**
 * Internal dependencies
 */
import {
  Button,
  Icons,
  BUTTON_VARIANTS,
  BUTTON_TYPES,
  BUTTON_SIZES,
} from '../../../design-system';
import { useConfig } from '../../app';
import useCarousel from './useCarousel';

const FlippableArrow = styled(Icons.Arrow)`
  transform: rotate(${({ isLeft }) => (isLeft ? 0 : 0.5)}turn);
`;

function CarouselScrollButton({ isNext = false }) {
  const {
    hasOverflow,
    canScrollBack,
    canScrollForward,
    scrollBack,
    scrollForward,
  } = useCarousel(
    ({
      state: { hasOverflow, canScrollBack, canScrollForward },
      actions: { scrollBack, scrollForward },
    }) => ({
      hasOverflow,
      canScrollBack,
      canScrollForward,
      scrollBack,
      scrollForward,
    })
  );
  const { isRTL } = useConfig();

  if (!hasOverflow) {
    // If no overflow, just abort quickly
    return null;
  }

  const canScroll = isNext ? canScrollForward : canScrollBack;
  const onClick = isNext ? scrollForward : scrollBack;
  const label = isNext
    ? __('Scroll Forward', 'web-stories')
    : __('Scroll Back', 'web-stories');

  // If reading direction is RTL and this is next button, it's pointing left.
  // If reading direction is !RTL and this is !next button, it's pointing left.
  // Otherwise it's a right.
  // Thus, if the two bools are equal, it's a left button.
  const isLeft = isRTL === isNext;

  return (
    <Button
      variant={BUTTON_VARIANTS.SQUARE}
      type={BUTTON_TYPES.PLAIN}
      size={BUTTON_SIZES.SMALL}
      isDisabled={!canScroll}
      onClick={onClick}
      aria-label={label}
    >
      <FlippableArrow isLeft={isLeft} />
    </Button>
  );
}

CarouselScrollButton.propTypes = {
  isNext: PropTypes.bool,
};

function CarouselScrollForward() {
  return <CarouselScrollButton isNext />;
}

function CarouselScrollBack() {
  return <CarouselScrollButton />;
}

export { CarouselScrollForward, CarouselScrollBack };
