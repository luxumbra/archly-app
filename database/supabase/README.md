# Yore Database Setup - Supabase PostgreSQL

Complete database setup for the Yore archaeological site discovery app with gamification, user management, and geographic features.

## 📋 Overview

This database setup provides:
- **User profiles** with authentication integration
- **Archaeological places** with geographic data (PostGIS)
- **Gamification system** with points, achievements, and streaks
- **User interactions** (visits, favorites, reviews, photos)
- **AI chat sessions** for site information
- **Row Level Security (RLS)** policies for data protection
- **PostgreSQL functions** for complex business logic

## 🗂️ File Structure

```
database/supabase/
├── 01_setup.sql          # Core database schema with all tables
├── 02_functions.sql      # PostgreSQL functions for business logic  
├── 03_security.sql       # RLS policies and security configuration
├── 04_seed.sql          # Sample data and achievements
├── 05_test_queries.sql   # Test queries to verify setup
├── types.ts             # TypeScript types for frontend integration
└── README.md            # This file
```

## 🚀 Quick Start

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be ready
3. Go to the SQL Editor in your Supabase dashboard

### 2. Run Database Setup

Execute the SQL files in order:

```bash
# 1. Core schema and tables
psql -f 01_setup.sql

# 2. Business logic functions  
psql -f 02_functions.sql

# 3. Security policies
psql -f 03_security.sql

# 4. Sample data and achievements
psql -f 04_seed.sql

# 5. Test the setup (optional)
psql -f 05_test_queries.sql
```

**Or in Supabase Dashboard:**
1. Copy and paste each file's contents into the SQL Editor
2. Run them in sequence (01 → 02 → 03 → 04 → 05)
3. Optionally run `SELECT create_sample_test_data();` to create test users and photos

### 3. Configure Environment Variables

Add these to your `.env` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 4. Frontend Integration

Copy `types.ts` to your frontend project:

```typescript
import { Database } from './database/supabase/types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

## 🗃️ Database Schema

### Core Tables

| Table | Purpose |
|-------|---------|
| `user_profiles` | Extended user data beyond Supabase auth |
| `places` | Archaeological sites with location data |
| `point_transactions` | All point awards/deductions |
| `place_visits` | User visit tracking with GPS verification |
| `place_favorites` | User favorite places |
| `place_photos` | User-uploaded photos with moderation |
| `place_reviews` | User reviews and ratings |
| `achievements` | Available achievements |
| `user_achievements` | User achievement progress |
| `daily_streaks` | Login streak tracking |
| `place_discoveries` | Track who discovered each place first |
| `ai_chat_sessions` | Store AI chat interactions |

### Key Features

- **PostGIS Geography**: Efficient location storage and queries
- **JSONB Fields**: Flexible metadata storage
- **UUID Primary Keys**: Secure, distributed-friendly IDs
- **Proper Indexing**: Optimized for performance
- **Foreign Key Constraints**: Data integrity
- **Updated Triggers**: Automatic timestamp management

## 🔧 Key Functions

### Points System
```sql
-- Award points with bonuses and multipliers
SELECT award_points(user_id, 'discover_place', 30, place_id, '{"verified": true}');

-- Handle daily login streaks
SELECT handle_daily_login(user_id);
```

### Place Management
```sql
-- Add place from Google Places API
SELECT upsert_place_from_api(google_id, name, lat, lng, address, type, data, user_id);

-- Record user visit
SELECT record_place_visit(user_id, place_id, true, 5.0, 'Great site!');

-- Get nearby places
SELECT * FROM get_nearby_places(51.178844, -1.826215, 5000, 20);
```

### User Data
```sql
-- Get place with user-specific data
SELECT * FROM get_place_with_user_data(place_id, user_id);

-- Check for achievement unlocks
SELECT check_achievements(user_id, 'visit_place');
```

## 🔐 Security Features

### Row Level Security (RLS)

All tables have RLS enabled with policies:

- **User Profiles**: Users can view their own data and public info of others
- **Places**: Public readable, authenticated users can modify
- **Personal Data**: Users can only access their own visits, favorites, etc.
- **Admin Access**: Admin users can manage all data for moderation

### Admin Functions

```sql
-- Check if user is admin
SELECT is_admin(user_id);

-- Grant admin role (admin-only)
SELECT grant_admin_role(user_id);

-- Revoke admin role (admin-only)  
SELECT revoke_admin_role(user_id);
```

## 🏆 Points & Achievements System

### Point Actions
- **Discover Place**: 30 points (+50% for GPS verification)
- **Visit Place**: 10 points (+5 bonus for GPS verification)
- **Favorite Place**: 2 points
- **Write Review**: 5 points
- **Upload Photo**: 3 points
- **Daily Login**: 5 points (streak bonuses)

### Achievement Categories
- **Discovery**: Finding new archaeological sites
- **Visitation**: Visiting different sites
- **Streak**: Daily login consistency
- **Social**: Reviews and community interaction
- **Exploration**: Visiting sites from different periods
- **Knowledge**: Favorites and photo contributions

## 📍 Geographic Features

### PostGIS Integration
- **GEOGRAPHY(POINT, 4326)**: Efficient location storage
- **Spatial Indexing**: Fast proximity queries
- **Distance Calculations**: Accurate geographic distance
- **Radius Searches**: Find places within specified distance

### Location Functions
```sql
-- Find places within 5km of coordinates
SELECT * FROM get_nearby_places(latitude, longitude, 5000);

-- Calculate distance between points
SELECT ST_Distance(location1, location2) as distance_meters;
```

## 🧪 Testing

Run the test queries to verify your setup:

```sql
-- Run all tests
\i 05_test_queries.sql

-- Or run specific test sections
SELECT 'PostGIS Extension Test' as test_name;
SELECT postgis_version();
```

**Important Testing Notes:**
- In production Supabase environments, some tests may be skipped due to auth table restrictions
- Tests that require creating users will attempt to create mock auth users, but will gracefully skip if this fails
- This is expected behavior and doesn't indicate a problem with your database setup

### Test Coverage
- ✅ Table creation and structure
- ✅ PostGIS extension functionality
- ✅ User profile and points system
- ✅ Place search and nearby queries
- ✅ Daily login streak handling
- ✅ Visit recording and favorites
- ✅ Achievement system
- ✅ RLS policy enforcement
- ✅ Performance indexes
- ✅ Complete user flow simulation

## 📊 Sample Data

The seed file includes:
- **30+ Achievements** across all categories
- **10 Sample Places** (UK archaeological sites)
- **Test Data Functions** for development
- **Sample User Creation** utilities

### Create Test Data
```sql
-- Create sample test data (includes test user, visits, photos, etc.)
SELECT create_sample_test_data();

-- Reset test data
SELECT reset_test_data();

-- Get database statistics
SELECT * FROM get_database_stats();
```

**Note**: The basic seed file (`04_seed.sql`) creates achievements and places but no users or photos. To create sample users and photos for testing, call the `create_sample_test_data()` function after running the seed file.

**Production Environments**: In production Supabase environments, the `create_sample_test_data()` function will fail gracefully if it cannot create test auth users. This is expected behavior and ensures your production database remains secure.

## 🔧 Development Tools

### Useful Queries

```sql
-- Check table record counts
SELECT * FROM get_database_stats();

-- View user leaderboard
SELECT username, total_points, places_discovered, places_visited
FROM user_profiles
ORDER BY total_points DESC
LIMIT 10;

-- Find popular places
SELECT name, total_visits, avg_rating
FROM places
ORDER BY total_visits DESC
LIMIT 10;
```

### Debugging

```sql
-- Check RLS policies
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- View function definitions
SELECT routine_name, routine_type FROM information_schema.routines 
WHERE routine_schema = 'public';

-- Monitor geographic queries
EXPLAIN ANALYZE SELECT * FROM get_nearby_places(51.178844, -1.826215, 5000);
```

## 🚀 Production Considerations

### Performance
- All critical queries are indexed
- Geographic queries use spatial indexes
- JSONB fields have GIN indexes where appropriate
- Consider query optimization based on usage patterns

### Scaling
- UUID primary keys support distributed systems
- Geographic queries scale well with PostGIS
- Consider read replicas for heavy read workloads
- Monitor and optimize based on actual usage

### Security
- RLS policies protect user data
- Admin functions have proper access controls
- All functions use SECURITY DEFINER appropriately
- Regular security audits recommended

### Monitoring
- Track point transaction volumes
- Monitor achievement unlock rates
- Watch for geographic query performance
- Set up alerts for unusual patterns

## 📝 API Integration Examples

### JavaScript/TypeScript

```typescript
// Award points
const { data } = await supabase.rpc('award_points', {
  user_id: user.id,
  action_type: 'visit_place',
  base_points: 10,
  place_id: place.id,
  metadata: { verified: true }
});

// Get nearby places
const { data: places } = await supabase.rpc('get_nearby_places', {
  lat: 51.178844,
  lng: -1.826215,
  radius_meters: 5000,
  limit: 20
});

// Record visit
const { data: visitId } = await supabase.rpc('record_place_visit', {
  user_id: user.id,
  place_id: place.id,
  location_verified: true,
  gps_accuracy: 3.0,
  notes: 'Amazing historical site!'
});
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [PostGIS Documentation](https://postgis.net/documentation/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

## 🐛 Troubleshooting

### Common Issues

1. **PostGIS Extension Missing**
   ```sql
   CREATE EXTENSION IF NOT EXISTS "postgis";
   ```

2. **RLS Policies Too Restrictive**
   - Check user authentication
   - Verify policy conditions
   - Test with service role key

3. **Geographic Queries Slow**
   - Ensure spatial indexes exist
   - Check query explain plans
   - Consider query optimization

4. **Function Execution Errors**
   - Check function parameter types
   - Verify user permissions
   - Review function definitions

### Support

For issues with this database setup:
1. Check the test queries output
2. Review Supabase logs
3. Verify all files were executed in order
4. Check your environment variables

---

**Ready to explore the past! 🏛️**