# 처음 한 번만 하는 연결

## 1) Supabase
1. https://supabase.com 에서 새 프로젝트 생성
2. 왼쪽 `SQL Editor` → `New query`
3. `supabase/schema.sql` 전체 붙여넣기 → Run
4. 새 query에서 `supabase/seed.sql` 전체 붙여넣기 → Run
5. `Project Settings → API`에서 아래 두 값을 확인
   - Project URL
   - anon / public key

## 2) 웹앱 설정
`config.js`를 열어 다음 두 곳만 채웁니다.

```js
SUPABASE_URL: "여기에 Project URL",
SUPABASE_ANON_KEY: "여기에 anon public key",
```

anon public key는 브라우저용 공개키입니다. `service_role` 키는 절대 config.js에 넣지 않습니다.

## 3) 추천물건 입력 API
Supabase Dashboard에서 `Edge Functions`에 `intake` 함수를 배포합니다.
배포 파일은 `supabase/functions/intake/index.ts`입니다.

Function Secret으로 `INTAKE_SECRET`을 원하는 긴 비밀번호로 설정합니다.
예: 임의의 20자 이상 문자열.

웹앱에서 온라인 신규등록을 처음 할 때 이 비밀번호를 한 번 묻고, 브라우저 탭을 닫기 전까지만 기억합니다.

## 4) GitHub Pages
1. GitHub 새 저장소 생성 (예: `academy-auction-db`)
2. 이 폴더 안의 파일들을 저장소 최상단에 업로드
3. `Settings → Pages`
4. `Deploy from a branch`
5. Branch `main`, Folder `/(root)` → Save
6. 잠시 후 표시되는 `https://계정명.github.io/academy-auction-db/` 주소 접속

## 5) Notion
Notion 페이지에서 `/embed` → 위 GitHub Pages 주소 붙여넣기.
이후 DB가 바뀌면 같은 주소에서 최신 내용이 보입니다.

---

# 중요한 현재 상태
이 배포를 끝내면 웹앱과 Notion은 같은 온라인 DB를 보게 됩니다.

아직 자동 경매조회는 연결 전이므로 신규 사건은 처음에 `미조회`로 들어갑니다.
다음 단계에서:

`추천물건 등록 → 경매정보 자동조회 → DB 갱신 → 진행중 사건 재조회 → 낙찰결과 자동반영`

순서로 붙이면 됩니다.
