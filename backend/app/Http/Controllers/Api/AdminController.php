<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BorrowLog;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function users(Request $request): JsonResponse
    {
        $users = User::query()
            ->withCount('borrowLogs')
            ->with(['borrowLogs' => function ($q) {
                $q->latest('borrowed_at')->limit(10);
            }, 'borrowLogs.book.category'])
            ->orderByDesc('last_login_at')
            ->orderBy('name')
            ->get()
            ->map(function (User $user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'avatar' => $user->avatar,
                    'last_login_at' => $user->last_login_at?->toIso8601String(),
                    'borrow_logs_count' => $user->borrow_logs_count,
                    'recent_borrows' => $user->borrowLogs->map(fn (BorrowLog $log) => [
                        'id' => $log->id,
                        'book_id' => $log->book_id,
                        'book_title' => $log->book?->title,
                        'status' => $log->status,
                        'borrowed_at' => $log->borrowed_at?->toIso8601String(),
                        'returned_at' => $log->returned_at?->toIso8601String(),
                    ]),
                ];
            });

        return response()->json(['data' => $users]);
    }

    public function borrowLogs(Request $request): JsonResponse
    {
        $logs = BorrowLog::query()
            ->with(['user', 'book.category'])
            ->latest('borrowed_at')
            ->limit(200)
            ->get()
            ->map(function (BorrowLog $log) {
                return [
                    'id' => $log->id,
                    'status' => $log->status,
                    'borrowed_at' => $log->borrowed_at?->toIso8601String(),
                    'returned_at' => $log->returned_at?->toIso8601String(),
                    'user' => $log->user ? [
                        'id' => $log->user->id,
                        'name' => $log->user->name,
                        'email' => $log->user->email,
                        'last_login_at' => $log->user->last_login_at?->toIso8601String(),
                    ] : null,
                    'book' => $log->book ? [
                        'id' => $log->book->id,
                        'title' => $log->book->title,
                        'category' => $log->book->category?->name,
                        'image' => $log->book->image,
                    ] : null,
                ];
            });

        return response()->json(['data' => $logs]);
    }
}
