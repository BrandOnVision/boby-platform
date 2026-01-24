import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { JobsPage } from './pages/JobsPage';
import { EarningsPage } from './pages/EarningsPage';
import { ProfilePage } from './pages/ProfilePage';
function App() {
    return (_jsx(Routes, { children: _jsxs(Route, { path: "/", element: _jsx(Layout, {}), children: [_jsx(Route, { index: true, element: _jsx(HomePage, {}) }), _jsx(Route, { path: "jobs", element: _jsx(JobsPage, {}) }), _jsx(Route, { path: "earnings", element: _jsx(EarningsPage, {}) }), _jsx(Route, { path: "profile", element: _jsx(ProfilePage, {}) })] }) }));
}
export default App;
//# sourceMappingURL=App.js.map