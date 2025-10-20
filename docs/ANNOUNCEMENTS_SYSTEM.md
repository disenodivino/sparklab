# Announcements System Documentation

## Overview
The announcements system has been refactored to use a dedicated `announcements` table instead of the `messages` table for broadcast messages. This provides better data organization and improved performance.

## Database Schema

### Announcements Table
```sql
CREATE TABLE public.announcements (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  message text NOT NULL,
  CONSTRAINT announcements_pkey PRIMARY KEY (id)
);
```

### Required RLS Policies
See `docs/announcements-rls-policies.sql` for the complete RLS policies. Key policies include:
- Allow INSERT for authenticated/anon users (organizers can create)
- Allow SELECT for authenticated/anon users (teams can read)
- Allow UPDATE/DELETE for authenticated users (organizer management)

## System Architecture

### Organizer Side
**File:** `src/app/event/organizer/messages/page.tsx`

**Features:**
- Send broadcast announcements to all teams
- Send direct messages to specific teams
- View all sent announcements
- Real-time announcement updates

**Key Functions:**
```typescript
// Send announcement
handleSendAnnouncement() {
  if (selectedTeamId) {
    // Direct message → insert into messages table
  } else {
    // Broadcast → insert into announcements table
    await supabase.from('announcements').insert({
      message: announcementMessage.trim(),
      created_at: new Date().toISOString()
    });
    await fetchAnnouncements(); // Refresh list
  }
}

// Fetch announcements
fetchAnnouncements() {
  const { data } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false });
  setAnnouncements(data || []);
}
```

### Team Dashboard - Main Page
**File:** `src/app/event/dashboard/page.tsx`

**Features:**
- Display recent announcements (last 30 days, max 3)
- Show announcement count in stats
- Link to full announcements page

**Key Functions:**
```typescript
// Fetch recent announcements
const { data: recentAnnouncements, error } = await supabase
  .from('announcements')
  .select('*')
  .gte('created_at', thirtyDaysAgo.toISOString())
  .order('created_at', { ascending: false });

const announcementsArray = recentAnnouncements?.slice(0, 3) || [];

// Update stats
setStats({
  unreadAnnouncements: recentAnnouncements?.length || 0,
  ...
});
```

### Team Dashboard - Announcements Page
**File:** `src/app/event/dashboard/announcements/page.tsx`

**Features:**
- Display all announcements
- Real-time updates via Supabase subscriptions
- Auto-refresh when new announcements arrive

**Key Functions:**
```typescript
// Fetch all announcements
const { data } = await supabase
  .from('announcements')
  .select('*')
  .order('created_at', { ascending: false });

// Real-time subscription
const channel = supabase
  .channel('announcements')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'announcements' },
    () => fetchAnnouncements()
  )
  .subscribe();
```

## Data Flow

### Broadcasting an Announcement
1. Organizer creates message in `/event/organizer/messages`
2. If "Send to Everyone" → Insert into `announcements` table
3. If specific team → Insert into `messages` table
4. `fetchAnnouncements()` refreshes organizer's announcements list
5. Supabase real-time triggers team dashboards to refresh

### Viewing Announcements (Team)
1. Team visits `/event/dashboard` or `/event/dashboard/announcements`
2. Fetch from `announcements` table (no team-specific filtering needed)
3. Display all announcements with timestamps
4. Real-time subscription updates on new announcements

## Key Differences from Old System

### Old System (Messages Table)
- ❌ Duplicate records for each team
- ❌ Complex filtering and deduplication logic
- ❌ Inefficient database queries
- ❌ Difficult to maintain

### New System (Announcements Table)
- ✅ Single record per announcement
- ✅ Simple, direct queries
- ✅ Better performance
- ✅ Clear separation of concerns
- ✅ Easier to manage and debug

## Testing

### Verify Organizer Can Send Announcements
1. Login as organizer at `/event/organizer`
2. Navigate to Messages section
3. Click "Send Announcement"
4. Select "Send to Everyone"
5. Type message and send
6. Verify appears in "Announcements" tab

### Verify Teams Can View Announcements
1. Login as team at `/event/login`
2. View dashboard - should see recent announcements
3. Click "View all announcements"
4. Verify all announcements are displayed
5. Send another announcement as organizer
6. Verify team dashboard updates automatically

## Troubleshooting

### Announcements Not Showing
1. **Check RLS Policies**: Run SQL in `docs/announcements-rls-policies.sql`
2. **Check Console**: Look for Supabase errors in browser console
3. **Verify Table Exists**: Query `SELECT * FROM announcements` in Supabase SQL Editor
4. **Check Timestamps**: Announcements older than 30 days won't show on main dashboard

### Cannot Send Announcements
1. **Check RLS INSERT Policy**: Ensure anon/authenticated users can insert
2. **Check Supabase Connection**: Verify environment variables are set
3. **Check Browser Console**: Look for detailed error messages
4. **Verify organizer login**: Ensure logged in as organizer

## File Changes Summary

### Modified Files
- `src/app/event/organizer/messages/page.tsx` - Refactored to use announcements table
- `src/app/event/dashboard/page.tsx` - Updated to fetch from announcements table
- `src/app/event/dashboard/announcements/page.tsx` - Simplified to use announcements table

### Created Files
- `docs/announcements-rls-policies.sql` - RLS policies for announcements table
- `docs/ANNOUNCEMENTS_SYSTEM.md` - This documentation

## Future Enhancements

### Potential Features
- [ ] Delete announcements (organizer)
- [ ] Edit announcements (organizer)
- [ ] Mark announcements as read (team)
- [ ] Announcement categories/tags
- [ ] Scheduled announcements
- [ ] Rich text formatting
- [ ] Attachment support
- [ ] Push notifications

## Related Documentation
- `README.md` - Main project documentation
- `DEPLOYMENT.md` - Deployment instructions
- `PRODUCTION_READY.md` - Production readiness checklist
