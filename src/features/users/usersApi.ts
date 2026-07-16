import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import type { Role, User, UsersPage, UsersPageArgs } from './types'

/** Fake backend (my-json-server). See README.md for the full contract. */
const BASE_URL =
  'https://my-json-server.typicode.com/ProjectINT/empty-react-template'

/** Fields the server can be filtered by for uniqueness checks. */
export type UniqueField = 'username' | 'email'

export interface UniqueCheckArgs {
  field: UniqueField
  value: string
  /** Exclude the record being edited from the conflict set. */
  excludeId?: number
}

export interface UpdateUserArgs {
  id: number
  changes: Partial<User>
  /** Page coordinates so the cached list row can be patched in place. */
  page: number
  limit: number
}

export interface ToggleActiveArgs {
  id: number
  active: boolean
  page: number
  limit: number
}

export const usersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_URL }),
  // Writes are faked server-side and never persisted, so we never invalidate;
  // cache is mutated by hand to keep the UI behaving as if writes applied.
  endpoints: (build) => ({
    /** One page of users; total count is taken from the `X-Total-Count` header. */
    getUsersPage: build.query<UsersPage, UsersPageArgs>({
      query: ({ page, limit }) => ({
        url: '/users',
        params: { _page: page, _limit: limit },
      }),
      transformResponse: (items: User[], meta) => {
        const header = meta?.response?.headers.get('X-Total-Count')
        const total = header != null ? Number(header) : items.length
        return { items, total: Number.isFinite(total) ? total : items.length }
      },
    }),

    /** Role reference resource — powers the role <select>. */
    getRoles: build.query<Role[], void>({
      query: () => '/roles',
    }),

    /**
     * Uniqueness check via server-side filtering. Returns the conflicting
     * records (excluding the edited user), so an empty array means "unique".
     */
    checkUnique: build.query<User[], UniqueCheckArgs>({
      query: ({ field, value }) => ({
        url: '/users',
        params: { [field]: value },
      }),
      transformResponse: (users: User[], _meta, { excludeId }) =>
        users.filter((u) => u.id !== excludeId),
      keepUnusedDataFor: 30,
    }),

    /** Optimistic block / unblock; rolls back the cached row on failure. */
    toggleUserActive: build.mutation<User, ToggleActiveArgs>({
      query: ({ id, active }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: { active },
      }),
      async onQueryStarted(
        { id, active, page, limit },
        { dispatch, queryFulfilled },
      ) {
        const patch = dispatch(
          usersApi.util.updateQueryData(
            'getUsersPage',
            { page, limit },
            (draft) => {
              const user = draft.items.find((u) => u.id === id)
              if (user) user.active = active
            },
          ),
        )
        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
    }),

    /** Save edited fields; on success the cached list row is patched in place. */
    updateUser: build.mutation<User, UpdateUserArgs>({
      query: ({ id, changes }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body: changes,
      }),
      async onQueryStarted(
        { id, changes, page, limit },
        { dispatch, queryFulfilled },
      ) {
        // Apply only after the server confirms, so a failed save leaves the
        // list untouched and the dialog can surface the error.
        await queryFulfilled
        dispatch(
          usersApi.util.updateQueryData(
            'getUsersPage',
            { page, limit },
            (draft) => {
              const user = draft.items.find((u) => u.id === id)
              if (user) Object.assign(user, changes)
            },
          ),
        )
      },
    }),
  }),
})

export const {
  useGetUsersPageQuery,
  useGetRolesQuery,
  useLazyCheckUniqueQuery,
  useToggleUserActiveMutation,
  useUpdateUserMutation,
} = usersApi
