import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './components/Login/LoginPage';
import Header from './components/Header/Header';
import UserSignupPage from './components/Signup/UserSignupPage';
import MainPage from './components/MainPage/MainPage';
import NightmareDetail from './components/MainPage/NightmareDetail';
import InputNightmare from './components/MainPage/InputNightmare';
import DisplayNightmare from './components/MainPage/DisplayNightmare';
import HomePage from './components/HomePage/HomePage';
import MyPage from './components/MyPage/MyPage';
import AccountSettings from './components/AccountSettings/AccountSettings';
import PasswordResetRequest from './components/PasswordResetRequest/PasswordResetRequest';
import PasswordReset from './components/PasswordReset/PasswordReset';
import { login } from './store/slices/authSlice';
import { startLoading, stopLoading } from './store/slices/loadingSlice'; // ローディングアクションのインポート
import { RootState } from './store/store'; // RootStateをインポート
import './loading.css'; // ローディング用のCSSをインポート
import Loading from './components/Loading/Loading'; // カスタマイズしたローディングアニメーションをインポート

const routes = [
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  { path: '/signup', element: <UserSignupPage /> },
  { path: '/mainPage', element: <MainPage /> },
  { path: '/nightmares/:id', element: <NightmareDetail /> },
  { path: '/input-nightmare', element: <InputNightmare /> },
  { path: '/modified-nightmare', element: <DisplayNightmare /> },
  { path: '/mypage', element: <MyPage /> },
  { path: '/account-settings', element: <AccountSettings /> }, // 新しいルートの追加
  { path: '/password-reset-request', element: <PasswordResetRequest /> }, // 新しいルートの追加
  { path: '/password-reset', element: <PasswordReset /> }, // 新しいルートの追加
];

function App() {
  const dispatch = useDispatch();
  const loading = useSelector((state: RootState) => state.loading); // ローディング状態の取得

  useEffect(() => {
    dispatch(startLoading()); // ローディング開始
    const token = localStorage.getItem('authToken');
    if (token) {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(jsonPayload);
      const userId = payload.user_id; // トークンのペイロードからユーザーIDを取得

      // バックエンドからユーザー情報を取得
      fetch(`${import.meta.env.VITE_APP_API_URL}/api/v1/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(data => {
          const user = { id: userId, name: data.name, email: data.email }; // idを追加
          console.log(user); // ここでユーザー情報を確認
          dispatch(login(user)); // ユーザー情報を渡してログイン状態を更新
          dispatch(stopLoading()); // ローディング終了
        })
        .catch(error => {
          console.error('Error fetching user data:', error);
          dispatch(stopLoading()); // ローディング終了
        });
    } else {
      dispatch(stopLoading()); // トークンがない場合もローディング終了
    }
  }, [dispatch]);

  return (
    <Router>
      <div className="min-h-screen pt-16"> {/* 64px(16rem)のパディングトップを追加 */}
        <Header />
        {loading ? (
          <Loading /> // カスタマイズしたローディングコンポーネントを表示
        ) : (
          <Routes>
            {routes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;
