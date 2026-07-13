import {
  Navigate,
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import Mainlayout from "./layout/MainLayout";
import RequireAuth from "./component/RequireAuth";
import Chat from "./pages/Chat";
import ChatPage from "./pages/ChatPage";
import Friends from "./pages/Friends";
import AddMembers from "./pages/AddMembers";
import CreateGroup from "./pages/CreateGroup";
import GroupDetails from "./pages/GroupDetails";
import Notification from "./pages/Notification";
import Groups from "./pages/Groups";
import Settings from "./pages/Settings";
import ChangeUsername from "./pages/ChangeUsername";
import ChangeEmail from "./pages/ChangeEmail";
import ChangePhone from "./pages/ChangePhone";
import ChangePassword from "./pages/ChangePassword";
import UploadProfilePicture from "./pages/UploadProfilePicture";
import NotificationSettings from "./pages/NotificationSettings";
import PrivacySecurity from "./pages/PrivacySecurity";
import Appearance from "./pages/Appearance";
import HelpSupport from "./pages/HelpSupport";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfilePage from "./pages/ProfilePage";
import PremiumGroupChatPage from "./pages/PremiumGroupChatPage";

const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Mainlayout />
            </RequireAuth>
          }
        >
          <Route index element={<Chat />} />
          <Route path="friends" element={<Friends />} />
          <Route path="notification" element={<Notification />} />
          <Route path="groups" element={<Groups />} />
          <Route path="settings" element={<Settings />} />
          <Route path="settings/change-username" element={<ChangeUsername />} />
          <Route path="settings/change-email" element={<ChangeEmail />} />
          <Route path="group/:groupId/add-members" element={<AddMembers />} />
          <Route path="create-group" element={<CreateGroup />} />
          <Route path="group/:groupId" element={<GroupDetails />} />
          <Route path="groupChat/:groupId" element={<PremiumGroupChatPage />} />
          <Route path="profile/:id" element={<ProfilePage />} />
          <Route path="chat/user/:userId" element={<ChatPage />} />

          <Route path="settings/change-phone" element={<ChangePhone />} />
          <Route
            path="settings/upload-profile-picture"
            element={<UploadProfilePicture />}
          />
          <Route path="settings/change-password" element={<ChangePassword />} />
          <Route
            path="settings/notification-settings"
            element={<NotificationSettings />}
          />
          <Route
            path="settings/privacy-security"
            element={<PrivacySecurity />}
          />
          <Route path="settings/appearance" element={<Appearance />} />
          <Route path="settings/help-support" element={<HelpSupport />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </>,
    ),
  );

  return <RouterProvider router={router} />;
};

export default App;
