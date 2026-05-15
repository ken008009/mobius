import { lazy } from 'react';

const Home = lazy(() => import('@pages/home'));
const Admin = lazy(() => import('@pages/admin'));
const About = lazy(() => import('@pages/subPages/about'));
const Staking = lazy(() => import('@pages/subPages/staking'));
const Community = lazy(() => import('@pages/subPages/community'));
const Nodes = lazy(() => import('@pages/subPages/nodes'));
const Courses = lazy(() => import('@pages/subPages/courses'));
const Hls = lazy(() => import('@pages/subPages/hls'));

const routes = [
  { path: '/', element: Home },
  { path: '/about', element: About},
  { path: '/staking', element: Staking},
  { path: '/community', element: Community},
  { path: '/nodes', element: Nodes},
  { path: '/courses', element: Courses},
  { path: '/hls', element: Hls},
  { path: '/admin', element: Admin},
]

export default routes;