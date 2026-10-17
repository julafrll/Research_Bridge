-- Remove temporary upload policies
DROP POLICY IF EXISTS "temp_read_lesson_videos_anon" ON storage.objects;
DROP POLICY IF EXISTS "temp_upload_lesson_videos_anon" ON storage.objects;
DROP POLICY IF EXISTS "temp_update_lesson_videos_anon" ON storage.objects;
