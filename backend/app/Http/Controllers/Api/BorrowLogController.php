<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use App\Models\BorrowLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class BorrowLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $logs = BorrowLog::query()
            ->with('book.category')
            ->where('user_id', $request->user()->id)
            ->latest('borrowed_at')
            ->get()
            ->map(fn (BorrowLog $log) => $this->transform($log));

        return response()->json(['data' => $logs]);
    }

    public function borrow(Request $request, Book $book): JsonResponse
    {
        $user = $request->user();

        $active = BorrowLog::query()
            ->where('user_id', $user->id)
            ->where('book_id', $book->id)
            ->where('status', 'borrowed')
            ->exists();

        if ($active) {
            return response()->json(['message' => 'You already have an active borrow for this book.'], 422);
        }

        if ($book->available_copies < 1) {
            return response()->json(['message' => 'No copies available.'], 422);
        }

        $log = BorrowLog::create([
            'user_id' => $user->id,
            'book_id' => $book->id,
            'borrowed_at' => Carbon::now(),
            'status' => 'borrowed',
        ]);

        $book->decrement('available_copies');
        $log->load('book.category');

        return response()->json([
            'message' => 'Book borrowed successfully.',
            'data' => $this->transform($log),
        ], 201);
    }

    public function returnBook(Request $request, Book $book): JsonResponse
    {
        $user = $request->user();

        $log = BorrowLog::query()
            ->where('user_id', $user->id)
            ->where('book_id', $book->id)
            ->where('status', 'borrowed')
            ->latest('borrowed_at')
            ->first();

        $now = Carbon::now();

        if ($log) {
            $log->update([
                'status' => 'returned',
                'returned_at' => $now,
            ]);

            if ($book->available_copies < $book->total_copies) {
                $book->increment('available_copies');
            }
        } else {
            // Match UI behavior: create a completed return record if none active.
            $log = BorrowLog::create([
                'user_id' => $user->id,
                'book_id' => $book->id,
                'borrowed_at' => $now,
                'returned_at' => $now,
                'status' => 'returned',
            ]);
        }

        $log->load('book.category');

        return response()->json([
            'message' => 'Book returned successfully.',
            'data' => $this->transform($log),
        ]);
    }

    private function transform(BorrowLog $log): array
    {
        $book = $log->book;

        return [
            'id' => $log->id,
            'book_id' => $log->book_id,
            'status' => $log->status,
            'return_status' => $log->status === 'returned' ? 'Returned' : 'Not yet',
            'borrowed_at' => $log->borrowed_at?->toIso8601String(),
            'borrow_date' => $log->borrowed_at?->format('M. j, Y'),
            'borrow_time' => $log->borrowed_at?->format('g:i a'),
            'returned_at' => $log->returned_at?->toIso8601String(),
            'return_date' => $log->returned_at?->format('M. j, Y') ?? '',
            'return_time' => $log->returned_at?->format('g:i a') ?? '',
            'book' => $book ? [
                'id' => $book->id,
                'title' => $book->title,
                'image' => $book->image,
                'category' => $book->category?->name,
                'availability' => $book->available_copies.' copies',
            ] : null,
        ];
    }
}
