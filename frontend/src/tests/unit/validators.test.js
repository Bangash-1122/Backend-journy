import {
    describe,
    it,
    expect
} from 'vitest';
import {
    loginSchema,
    registerSchema,
    uploadSchema,
    playlistSchema,
    commentSchema,
} from '@/lib/validators';

describe('validators schema', () => {
    it('validates login input', () => {
        const valid = loginSchema.safeParse({
            email: 'user@example.com',
            password: 'password123'
        });
        expect(valid.success).toBe(true);

        const invalid = loginSchema.safeParse({
            email: 'bad-email',
            password: '123'
        });
        expect(invalid.success).toBe(false);
    });

    it('validates register input', () => {
        const valid = registerSchema.safeParse({
            fullName: 'John Doe',
            username: 'johndoe_1',
            email: 'john@example.com',
            password: 'password1',
            confirmPassword: 'password1',
        });
        expect(valid.success).toBe(true);

        const mismatch = registerSchema.safeParse({
            fullName: 'John Doe',
            username: 'johndoe_1',
            email: 'john@example.com',
            password: 'password1',
            confirmPassword: 'different_password',
        });
        expect(mismatch.success).toBe(false);
    });

    it('validates upload input', () => {
        const valid = uploadSchema.safeParse({
            title: 'Valid Video Title',
            category: 'Tech',
            visibility: 'public',
        });
        expect(valid.success).toBe(true);

        const shortTitle = uploadSchema.safeParse({
            title: 'Hi',
            category: 'Tech',
            visibility: 'public',
        });
        expect(shortTitle.success).toBe(false);
    });

    it('validates playlist input', () => {
        const valid = playlistSchema.safeParse({
            name: 'My Playlist'
        });
        expect(valid.success).toBe(true);

        const empty = playlistSchema.safeParse({
            name: ''
        });
        expect(empty.success).toBe(false);
    });

    it('validates comment input', () => {
        const valid = commentSchema.safeParse({
            text: 'Nice video!'
        });
        expect(valid.success).toBe(true);

        const empty = commentSchema.safeParse({
            text: ''
        });
        expect(empty.success).toBe(false);
    });
});