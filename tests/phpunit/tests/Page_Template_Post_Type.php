<?php
/**
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

namespace Google\Web_Stories\Tests;

/**
 * @coversDefaultClass \Google\Web_Stories\Page_Template_Post_Type
 */
class Page_Template_Post_Type extends \WP_UnitTestCase {
	use Capabilities_Setup;
	/**
	 * @covers ::register
	 */
	public function test_register() {
		$story = $this->get_story_object();
		$story->register();

		$ptpt = new \Google\Web_Stories\Page_Template_Post_Type();
		$ptpt->register();

		$post_type_object = get_post_type_object( \Google\Web_Stories\Page_Template_Post_Type::POST_TYPE_SLUG );
		$this->assertSame( 'edit_web-stories', $post_type_object->cap->edit_posts );
		$this->assertSame( 'delete_web-stories', $post_type_object->cap->delete_posts );
	}
}
