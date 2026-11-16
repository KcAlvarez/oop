<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Book;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BookController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Book::query()->with('category');

        if ($search = $request->string('search')->toString()) {
            $query->where('title', 'like', '%'.$search.'%');
        }

        if ($category = $request->string('category')->toString()) {
            $query->whereHas('category', function ($q) use ($category) {
                $q->where('name', 'like', '%'.$category.'%');
            });
        }

        $books = $query->orderBy('title')->get()->map(fn (Book $book) => $this->transform($book));

        return response()->json(['data' => $books]);
    }

    public function featured(): JsonResponse
    {
        $books = Book::query()
            ->with('category')
            ->where('is_featured', true)
            ->orderBy('id')
            ->get()
            ->map(fn (Book $book) => $this->transform($book));

        return response()->json(['data' => $books]);
    }

    public function show(Book $book): JsonResponse
    {
        $book->load('category');

        return response()->json(['data' => $this->transform($book)]);
    }

    private function transform(Book $book): array
    {
        return [
            'id' => $book->id,
            'title' => $book->title,
            'description' => $book->description,
            'image' => $book->image,
            'category' => $book->category?->name,
            'category_id' => $book->category_id,
            'total_copies' => $book->total_copies,
            'available_copies' => $book->available_copies,
            'availability' => $book->available_copies.' copies',
            'is_featured' => $book->is_featured,
        ];
    }
}
