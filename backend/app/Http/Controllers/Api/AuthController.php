<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email', 'regex:/^[A-Za-z0-9._%+-]+@gmail\.com$/i'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'last_login_at' => now(),
        ]);

        $token = $this->issueToken($user);

        return response()->json([
            'message' => 'Registered successfully.',
            'token' => $token,
            'user' => $this->userPayload($user->fresh()),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'regex:/^[A-Za-z0-9._%+-]+@gmail\.com$/i'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 422);
        }

        $user->forceFill(['last_login_at' => now()])->save();
        $token = $this->issueToken($user);

        return response()->json([
            'message' => 'Login successful.',
            'token' => $token,
            'user' => $this->userPayload($user->fresh()),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->forceFill(['api_token' => null])->save();

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email', 'regex:/^[A-Za-z0-9._%+-]+@gmail\.com$/i'],
        ]);

        // In this project the mailer is log-based; for UI flow we accept the request.
        $user = User::where('email', $request->string('email'))->first();
        if ($user) {
            // Optionally: Password::sendResetLink($request->only('email'));
        }

        return response()->json([
            'message' => 'If the email exists, password reset instructions have been processed.',
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'regex:/^[A-Za-z0-9._%+-]+@gmail\.com$/i', Rule::exists('users', 'email')],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $user = User::where('email', $validated['email'])->firstOrFail();
        $user->forceFill([
            'password' => $validated['password'],
            'api_token' => null,
        ])->save();

        return response()->json(['message' => 'Password reset successfully.']);
    }

    private function issueToken(User $user): string
    {
        $plain = Str::random(60);
        $user->forceFill(['api_token' => hash('sha256', $plain)])->save();

        return $plain;
    }

    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'avatar' => $user->avatar,
            'last_login_at' => $user->last_login_at?->toIso8601String(),
            'is_admin' => (bool) $user->is_admin,
        ];
    }
}
