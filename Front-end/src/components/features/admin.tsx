import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Logo } from "@/lib/assets";
import {
  type AdminBorrowLog,
  type AdminUser,
  getAdminBorrowLogs,
  getAdminUsers,
  getToken,
} from "@/lib/api";

function fmt(dt?: string | null) {
  if (!dt) return "-";
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return dt;
  }
}

export default function AdminDatabase() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<AdminBorrowLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"users" | "logs">("users");

  useEffect(() => {
    if (!getToken()) {
      navigate("/");
      return;
    }
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [u, l] = await Promise.all([getAdminUsers(), getAdminBorrowLogs()]);
        setUsers(u.data || []);
        setLogs(l.data || []);
      } catch (err: any) {
        const msg = err?.message || "Failed to load database data.";
        setError(msg.includes("403") || msg.toLowerCase().includes("admin") ? "Access denied. Only admin users can view the database." : msg);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F5FAFD] flex flex-col items-center p-6">
      <header className="w-full max-w-6xl flex items-center justify-between pb-4 border-b border-gray-200 mb-6">
        <div className="flex items-center gap-3">
          <img src={Logo} alt="Cordova Public College Logo" className="w-14 h-14 object-contain" />
          <div>
            <h1 className="text-xl font-['Irish_Grover',cursive] text-black">CPC Library - Database</h1>
            <p className="text-xs text-gray-600">Users, logins, and borrowed books</p>
          </div>
        </div>
        <Link to="/homepage" className="px-4 py-2 bg-[#D9D9D9] hover:bg-gray-300 rounded-full text-sm font-medium text-black">
          Back to Home
        </Link>
      </header>

      <main className="w-full max-w-6xl flex flex-col gap-4">
        {error ? <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div> : null}
        {loading ? <p className="text-sm text-gray-600">Loading from database...</p> : null}

        <div className="flex gap-2">
          <button
            onClick={() => setTab("users")}
            className={`px-4 py-2 rounded-full text-sm font-medium ${tab === "users" ? "bg-[#143D99] text-white" : "bg-white border border-gray-300 text-gray-800"}`}
          >
            Users ({users.length})
          </button>
          <button
            onClick={() => setTab("logs")}
            className={`px-4 py-2 rounded-full text-sm font-medium ${tab === "logs" ? "bg-[#143D99] text-white" : "bg-white border border-gray-300 text-gray-800"}`}
          >
            Borrow Logs ({logs.length})
          </button>
        </div>

        {tab === "users" ? (
          <div className="flex flex-col gap-4">
            {users.map((u) => (
              <div key={u.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                  <div>
                    <p className="font-semibold text-black">{u.name} <span className="text-gray-500 font-normal">(#{u.id})</span></p>
                    <p className="text-sm text-gray-700">{u.email}</p>
                  </div>
                  <div className="text-sm text-gray-700">
                    <p><span className="font-medium">Last login:</span> {fmt(u.last_login_at)}</p>
                    <p><span className="font-medium">Borrow records:</span> {u.borrow_logs_count}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800 mb-2">Recent borrowed books</p>
                  {u.recent_borrows?.length ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border border-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-2 border-b">Book</th>
                            <th className="text-left p-2 border-b">Status</th>
                            <th className="text-left p-2 border-b">Borrowed at</th>
                            <th className="text-left p-2 border-b">Returned at</th>
                          </tr>
                        </thead>
                        <tbody>
                          {u.recent_borrows.map((b) => (
                            <tr key={b.id} className="border-b last:border-b-0">
                              <td className="p-2">{b.book_title || `Book #${b.book_id}`}</td>
                              <td className="p-2 capitalize">{b.status}</td>
                              <td className="p-2">{fmt(b.borrowed_at)}</td>
                              <td className="p-2">{fmt(b.returned_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No borrow records.</p>
                  )}
                </div>
              </div>
            ))}
            {!loading && users.length === 0 ? <p className="text-sm text-gray-600">No users found.</p> : null}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm overflow-x-auto">
            {logs.length ? (
              <table className="w-full text-sm border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-2 border-b">User</th>
                    <th className="text-left p-2 border-b">Email</th>
                    <th className="text-left p-2 border-b">Last Login</th>
                    <th className="text-left p-2 border-b">Book</th>
                    <th className="text-left p-2 border-b">Category</th>
                    <th className="text-left p-2 border-b">Status</th>
                    <th className="text-left p-2 border-b">Borrowed</th>
                    <th className="text-left p-2 border-b">Returned</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b last:border-b-0">
                      <td className="p-2">{log.user?.name || "-"}</td>
                      <td className="p-2">{log.user?.email || "-"}</td>
                      <td className="p-2">{fmt(log.user?.last_login_at)}</td>
                      <td className="p-2">{log.book?.title || "-"}</td>
                      <td className="p-2">{log.book?.category || "-"}</td>
                      <td className="p-2 capitalize">{log.status}</td>
                      <td className="p-2">{fmt(log.borrowed_at)}</td>
                      <td className="p-2">{fmt(log.returned_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              !loading && <p className="text-sm text-gray-600">No borrow logs found.</p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
