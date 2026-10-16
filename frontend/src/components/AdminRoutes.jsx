import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./AdminLayout"
import AdminDashboard from "../pages/AdminDashboard"
import AdminTickets from "../pages/admin/AdminTickets"
import AdminTicketDetails from "../pages/admin/AdminTicketDetails";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminUserDetails from "../pages/admin/AdminUserDetails";
import AdminWorkers from "../pages/admin/AdminWorkers";
import AdminWorkerDetails from "../pages/admin/AdminWorkerDetails";
import AdminAssignments from "../pages/admin/AdminAssignments";
import AdminAnalytics from "../pages/admin/AdminAnalytics";
import AdminNotifications from "../pages/admin/AdminNotifications";
import AdminActivityLogs from "../pages/admin/AdminActivityLogs";
import AdminSettings from "../pages/admin/AdminSettings";
export default function AdminRoutes() {
return (
<Routes>
<Route path="/" element={<AdminLayout />}>
<Route index element={<AdminDashboard />} />

    <Route path="tickets" element={<AdminTickets />} />
    <Route path="tickets/:id" element={<AdminTicketDetails />} />

    <Route path="users" element={<AdminUsers />} />
    <Route path="users/:id" element={<AdminUserDetails />} />

    <Route path="workers" element={<AdminWorkers />} />
    <Route path="workers/:id" element={<AdminWorkerDetails />} />

    <Route path="assignments" element={<AdminAssignments />} />
    <Route path="analytics" element={<AdminAnalytics />} />
    <Route path="notifications" element={<AdminNotifications />} />
    <Route path="activity-logs" element={<AdminActivityLogs />} />
    <Route path="settings" element={<AdminSettings />} />

    <Route path="*" element={<Navigate to="/admin" replace />} />
  </Route>
</Routes>

);
}

// export default function AdminRoutes() {
//   return <Routes><Route path="/admin" element={<AdminLayout/>}>
//     <Route index element={<AdminDashboard/>}/>
//     <Route path="tickets" element={<AdminTickets/>}/>
//     <Route path="tickets/:id" element={<AdminTicketDetails/>}/>
//     <Route path="users" element={<AdminUsers/>}/>
//     <Route path="users/:id" element={<AdminUserDetails/>}/>
//     <Route path="workers" element={<AdminWorkers/>}/>
//     <Route path="workers/:id" element={<AdminWorkerDetails/>}/>
//     <Route path="assignments" element={<AdminAssignments/>}/>
//     <Route path="analytics" element={<AdminAnalytics/>}/>
//     <Route path="notifications" element={<AdminNotifications/>}/>
//     <Route path="activity-logs" element={<AdminActivityLogs/>}/>
//     <Route path="settings" element={<AdminSettings/>}/>
//     <Route path="*" element={<Navigate to="/admin" replace/>}/>
//   </Route></Routes>;
// }
