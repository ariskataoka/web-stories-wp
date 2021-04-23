/*
 * Copyright 2021 Google LLC
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
import { useRef, useEffect } from 'react';

/**
 * Internal dependencies
 */
import { registerPropTypes } from './propTypes';
import { STORY_EVENTS } from './types';

function OnPageAddedRegister({ currentStory, dispatchStoryEvent }) {
  const hasFiredOnceRef = useRef(false);

  // Dispatch `onSecondPageAdded` story event once, the first time
  // the story grows to 2 or more pages.
  useEffect(() => {
    if (!hasFiredOnceRef.current && currentStory?.pages?.length > 1) {
      dispatchStoryEvent(STORY_EVENTS.onSecondPageAdded);
      hasFiredOnceRef.current = true;
    }
  }, [dispatchStoryEvent, currentStory?.pages]);

  return null;
}

OnPageAddedRegister.propType = registerPropTypes;

export { OnPageAddedRegister };
