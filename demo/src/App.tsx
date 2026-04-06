import { Link, NavLink, Outlet, Route, Routes } from 'react-router-dom';
import { PostItLayer } from 'post-it-library';
import './app.css';

function Shell() {
  return (
    <div className="shell">
      <nav className="shell__nav">
        <span className="shell__brand">포스트잇 라이브러리 데모</span>
        <NavLink to="/" className={({ isActive }) => (isActive ? 'active' : '')} end>
          홈
        </NavLink>
        <NavLink to="/page-b" className={({ isActive }) => (isActive ? 'active' : '')}>
          다른 페이지
        </NavLink>
        <NavLink to="/page-c" className={({ isActive }) => (isActive ? 'active' : '')}>
          설정 예시
        </NavLink>
      </nav>
      <main className="shell__main">
        <Outlet />
      </main>
      <PostItLayer />
    </div>
  );
}

function Home() {
  return (
    <div className="page">
      <h1>홈</h1>
      <p>
        다른 프로젝트에서는 <code>npm i post-it-library</code> 후 아래처럼 쓰면 됩니다. 스타일은{' '}
        <code>post-it-library/style.css</code> 를 한 번 import 하세요.
      </p>
      <pre className="page__code">
        {`import { PostItLayer } from 'post-it-library';
import 'post-it-library/style.css';

export function App() {
  return (
    <>
      <YourRoutes />
      <PostItLayer storageKey="my-app-notes" />
    </>
  );
}`}
      </pre>
      <p>
        위 메뉴로 이동해도 포스트잇은 그대로입니다. 내용은 브라우저 <code>localStorage</code>에 저장됩니다. 헤더의 빼기(−)는 보관으로
        보내고, 오른쪽 포스트잇 아이콘에서 다시 꺼낼 수 있습니다.
      </p>
    </div>
  );
}

function PageB() {
  return (
    <div className="page">
      <h1>다른 페이지</h1>
      <p>여기서도 같은 포스트잇 레이어가 유지됩니다.</p>
      <Link to="/">← 홈으로</Link>
    </div>
  );
}

function PageC() {
  return (
    <div className="page">
      <h1>설정 예시</h1>
      <p>라우트만 바뀐 상태입니다. 노트 데이터는 공유됩니다.</p>
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route element={<Shell />}>
        <Route index element={<Home />} />
        <Route path="page-b" element={<PageB />} />
        <Route path="page-c" element={<PageC />} />
      </Route>
    </Routes>
  );
}
