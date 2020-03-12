import React from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect
} from 'react-router-dom';
import store from './redux/store';
import App from './components/App';
import LoginPage from './components/LoginPage';
import PasswordReset from './components/PasswordReset';
import RegisterPage from './components/RegisterPage';
import ClusterPage from './components/ClusterPage';
import ClusterResourcesPage from './components/ClusterResourcesPage';
import ClusterNodes from './components/NodesList';
import PvcsList from './components/PvcsList';
import NamespacesListPage from './components/NamespacesList';
import PodsList from './components/PodsList';
import CreateNewPassword from './components/CreateNewPassword';
import ServicesListPage from './components/ServicesList';
import StorageClassList from './components/StorageClassList';
import PvsListPage from './components/PvsListPage';
import JobsListPage from './components/JobsListPage';
import DeploymentsPage from './components/DeploymentsPage';
import AdminProjectsPage from './components/AdminProjectsPage';
import VerificationSentPage from './components/VerificationSentPage';
import AdminLoginPage from './components/AdminLoginPage';

// Protected route should have token. If not, login.
const ProtectedRoute = ({ isAllowed, ...props }) => (
  isAllowed
    ? <Route {...props} />
    : <Redirect to="/login" />
);

// for now, existence of token will determine access to route
// later, this token will be a verified boolean
const hasToken = store.getState().user.accessToken;

const Routes = () => (
  <Router>
    <Switch>
      <Route exact path="/" component={App} />
      <Route path="/login" component={LoginPage} />
      <Route path="/admin-login" component={AdminLoginPage} />
      <Route path="/forgot-password" component={PasswordReset} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/new-password" component={CreateNewPassword} />
      <ProtectedRoute isAllowed={hasToken} path="/projects" component={AdminProjectsPage} />
      <Route path="/verify/:token" component={VerificationSentPage} />
      <ProtectedRoute isAllowed={hasToken} path="/clusters/:clusterID/resources" component={ClusterResourcesPage} />
      <ProtectedRoute isAllowed={hasToken} path="/clusters/:clusterID/services" component={ServicesListPage} />
      <ProtectedRoute isAllowed={hasToken} path="/clusters/:clusterID/volumes" component={PvsListPage} />
      <ProtectedRoute isAllowed={hasToken} path="/clusters/:clusterID/nodes" component={ClusterNodes} />
      <ProtectedRoute isAllowed={hasToken} path="/clusters/:clusterID/pvcs" component={PvcsList} />
      <ProtectedRoute isAllowed={hasToken} path="/clusters/:clusterID/namespaces" component={NamespacesListPage} />
      <ProtectedRoute isAllowed={hasToken} path="/clusters/:clusterID/pods" component={PodsList} />
      <ProtectedRoute isAllowed={hasToken} path="/clusters/:clusterID/storage-classes" component={StorageClassList} />
      <ProtectedRoute isAllowed={hasToken} path="/clusters/:clusterID/jobs" component={JobsListPage} />
      <ProtectedRoute isAllowed={hasToken} path="/clusters/:clusterID/deployments" component={DeploymentsPage} />
      <ProtectedRoute isAllowed={hasToken} exact path="/clusters" component={ClusterPage} />
    </Switch>
  </Router>
);

export default Routes;
