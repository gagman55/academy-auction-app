# 학원 추천물건 전용 웹앱 v2

기존 추천물건 655건을 포함한 배포 준비 버전입니다.

## 현재 바로 동작
- 사건번호 / 주소 / 단지명 검색
- 아파트 / 빌라 / 다가구 필터
- 진행 / 낙찰 / 변경 / 재확인 / 미조회 필터
- 감정가 / 유찰횟수 / 낙찰가 / 낙찰가율 / 입찰자수 표시
- CSV / Excel / PDF 내보내기
- 로컬 모드 신규 추천물건 등록
- Supabase 연결 후 온라인 DB 실시간 조회
- Supabase Edge Function을 통한 온라인 신규 추천물건 등록

## 배포 순서
자세한 클릭 순서는 `DEPLOY_5MIN.md`를 참고하세요.

1. Supabase 프로젝트 생성
2. `supabase/schema.sql` 실행
3. `supabase/seed.sql` 실행 → 기존 655건 업로드
4. `intake` Edge Function 배포 및 `INTAKE_SECRET` 설정
5. `config.js`에 Supabase URL과 anon key 입력
6. GitHub Pages에 이 폴더 전체 업로드
7. 생성된 웹주소를 Notion `/embed`로 삽입

## 아직 자동화 전인 부분
- 법원/민간 경매정보 상세 자동조회
- 진행중 사건 주기적 재조회
- ChatGPT 채팅 → intake API 직접 호출 연결

위 세 부분은 온라인 DB가 먼저 배포된 뒤 붙이는 2단계입니다.
