-- Temporarily allow anon uploads to lesson-videos bucket for video migration
DROP POLICY IF EXISTS "temp_read_lesson_videos_anon" ON storage.objects;
CREATE POLICY "temp_read_lesson_videos_anon" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'lesson-videos');

DROP POLICY IF EXISTS "temp_upload_lesson_videos_anon" ON storage.objects;
CREATE POLICY "temp_upload_lesson_videos_anon" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'lesson-videos');

DROP POLICY IF EXISTS "temp_update_lesson_videos_anon" ON storage.objects;
CREATE POLICY "temp_update_lesson_videos_anon" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'lesson-videos')
  WITH CHECK (bucket_id = 'lesson-videos');
