<?php

use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookController;
use App\Http\Controllers\Api\BorrowLogController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProfileController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);

    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/books', [BookController::class, 'index']);
    Route::get('/books/featured', [BookController::class, 'featured']);
    Route::get('/books/{book}', [BookController::class, 'show']);

    Route::middleware('auth.token')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::put('/profile', [ProfileController::class, 'update']);

        Route::get('/borrow-logs', [BorrowLogController::class, 'index']);
        Route::post('/books/{book}/borrow', [BorrowLogController::class, 'borrow']);
        Route::post('/books/{book}/return', [BorrowLogController::class, 'returnBook']);

        Route::middleware('admin')->group(function () {
            Route::get('/admin/users', [AdminController::class, 'users']);
            Route::get('/admin/borrow-logs', [AdminController::class, 'borrowLogs']);
        });
    });
});
