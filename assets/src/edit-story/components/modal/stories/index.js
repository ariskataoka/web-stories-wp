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
import { text } from '@storybook/addon-knobs';
import { useCallback, useState } from 'react';

/**
 * Internal dependencies
 */
import {
  Button,
  BUTTON_SIZES,
  BUTTON_TYPES,
  BUTTON_VARIANTS,
} from '../../../../design-system';
import Modal from '../';

export default {
  title: 'Stories Editor/Components/Modal',
  component: Modal,
};

export const _default = () => {
  const contentLabel = text('Content Label', 'Modal Content');

  const [open, setOpen] = useState(false);
  const openModal = useCallback(() => setOpen(true), [setOpen]);
  const closeModal = useCallback(() => setOpen(false), [setOpen]);

  return (
    <>
      <Button
        type={BUTTON_TYPES.PRIMARY}
        size={BUTTON_SIZES.SMALL}
        variant={BUTTON_VARIANTS.RECTANGLE}
        onClick={openModal}
      >
        {'Open Modal'}
      </Button>
      <Modal open={open} onClose={closeModal} contentLabel={contentLabel}>
        {'Content goes here'}
      </Modal>
    </>
  );
};
