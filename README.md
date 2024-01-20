# install
yarn && yarn dev
or 
yarn && yarn start

# 1. Login into supabase.
http://localhost:5000/api/github/login

# 2. Fetch commits by username and inserts into supabase.
http://localhost:5000/api/github/commit/[username]

# 3. Get all commits from supabase.
http://localhost:5000/api/github/commits
