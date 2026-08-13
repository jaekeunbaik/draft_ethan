-- ================================================================
-- history_items 어드민 전체 조회 권한 추가
-- Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql) 에서 실행
-- ================================================================

-- 1. 어드민이 모든 history_items를 조회/관리할 수 있는 RLS 정책 추가
DROP POLICY IF EXISTS "Admins can view all history items" ON public.history_items;
DROP POLICY IF EXISTS "Admins can manage all history items" ON public.history_items;

CREATE POLICY "Admins can manage all history items"
    ON public.history_items FOR ALL
    USING (public.is_admin());

-- 2. user_id가 NULL인 경우(게스트 제출)도 허용하도록 컬럼 제약 완화
--    (현재 NOT NULL로 설정되어 있어 비로그인 사용자 기록이 저장 실패함)
ALTER TABLE public.history_items ALTER COLUMN user_id DROP NOT NULL;

-- 3. 게스트(비로그인) 제출 허용 정책 추가
DROP POLICY IF EXISTS "Allow guest insert to history items" ON public.history_items;

CREATE POLICY "Allow guest insert to history items"
    ON public.history_items FOR INSERT
    WITH CHECK (user_id IS NULL);

-- 확인 쿼리 (실행 후 결과 확인)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'history_items'
ORDER BY policyname;
