# TrustRent — Flask Backend

## Setup

```bash
# 1. Clone and enter
cd trustrent-backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Copy env file and fill in values
cp .env.example .env

# 5. Add your Firebase credentials JSON file
# Download from Firebase Console > Project Settings > Service Accounts
# Save as firebase-credentials.json in root

# 6. Run schema in Supabase
# Open Supabase > SQL Editor > paste contents of migrations/schema.sql > Run

# 7. Start server
python run.py
```

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login | Firebase token → JWT |
| POST | /api/auth/setup-profile | Name, role, photo |
| POST | /api/auth/verify-aadhaar | Aadhaar hash + shadow record |
| GET | /api/auth/me | Get current user |
| PATCH | /api/auth/me | Update profile |

### Listings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/listings/ | Create listing (landlord) |
| GET | /api/listings/ | My listings (landlord) |
| GET | /api/listings/:id | Public listing detail |
| PATCH | /api/listings/:id | Update listing |
| DELETE | /api/listings/:id | Archive listing |
| POST | /api/listings/:id/restore | Restore archived |

### Search
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/search/?lat=&lng=&radius= | Geo search with filters |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/bookings/ | Create visit request (tenant) |
| GET | /api/bookings/ | My bookings |
| PATCH | /api/bookings/:id/respond | Accept or decline (landlord) |
| PATCH | /api/bookings/:id/cancel | Cancel (tenant) |

### Reviews
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/reviews/ | Leave review after visit |
| GET | /api/reviews/user/:id | Get user's reviews |

### Saved
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/saved/:listing_id | Save a property |
| DELETE | /api/saved/:listing_id | Unsave |
| GET | /api/saved/ | Get all saved |

### Messages (REST + Supabase Realtime)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/messages/ | Send message |
| GET | /api/messages/conversations | All conversations |
| GET | /api/messages/:conversation_id | Thread history |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/notifications/ | All notifications |
| PATCH | /api/notifications/:id/read | Mark one read |
| PATCH | /api/notifications/read-all | Mark all read |

## Realtime Messaging (Frontend Setup)

```js
// In your React component
import { supabase } from './services/supabase'

const channel = supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `receiver_id=eq.${currentUserId}`
  }, (payload) => {
    // new message received
    setMessages(prev => [...prev, payload.new])
  })
  .subscribe()

// cleanup
return () => supabase.removeChannel(channel)
```
