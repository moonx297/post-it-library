import { Link, NavLink, Outlet, Route, Routes } from 'react-router-dom';
import { PostItLayer } from './PostItLayer';
import './app.css';

function Shell() {
  return (
    <div className="shell">
      <nav className="shell__nav">
        <span className="shell__brand">포스트잇 노트</span>
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
        위 메뉴로 이동해도 포스트잇은 그대로입니다. 내용은 브라우저 <code>localStorage</code>에 저장됩니다.
      </p>
      <p>
        우측 하단 <strong>+</strong>로 추가, 헤더의 <strong>접기</strong>로 접으면 <strong>보관</strong> 버튼이 나타나며 한 번에
        펼칠 수 있습니다. 오른쪽 아래 모서리를 드래그해 크기를 조절하세요.
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
