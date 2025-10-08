# GitHub Actions Setup Guide

## Daily Supabase Version Requests Check

This workflow queries the `version_requests` table in Supabase daily and generates a report.

### Setup Instructions

1. **Add GitHub Secrets**
   
   Go to your repository settings → Secrets and variables → Actions, and add:
   
   - `SUPABASE_URL`: Your Supabase project URL
     - Example: `https://gxjgomnjtjtughcxawoz.supabase.co`
   
   - `SUPABASE_ANON_KEY`: Your Supabase anonymous key
     - This is the same key used in your deployment.html file

2. **Enable GitHub Actions**
   
   - Go to the "Actions" tab in your repository
   - Enable workflows if not already enabled

3. **Workflow Schedule**
   
   - Runs automatically daily at 8:00 AM UTC (10:00 AM Israel time)
   - Can be triggered manually from the Actions tab using "Run workflow"

4. **View Results**
   
   - Go to Actions tab → Daily Supabase Version Requests Check
   - Click on the latest run
   - Download the artifact to see the JSON report

### What the Workflow Does

1. **Queries Supabase**: Fetches all records from the `version_requests` table
2. **Logs Results**: Displays the count and data in the workflow logs
3. **Creates Report**: Generates a JSON file with all version requests
4. **Uploads Artifact**: Saves the report as a downloadable artifact (retained for 30 days)

### Manual Trigger

You can manually trigger the workflow:
1. Go to Actions → Daily Supabase Version Requests Check
2. Click "Run workflow"
3. Select the branch (usually `main`)
4. Click "Run workflow"

### Customization Options

#### Change Schedule
Edit the cron expression in the workflow file:
```yaml
schedule:
  - cron: '0 8 * * *'  # Current: 8:00 AM UTC daily
```

Common schedules:
- `'0 */6 * * *'` - Every 6 hours
- `'0 0 * * 1'` - Every Monday at midnight
- `'30 12 * * *'` - Daily at 12:30 PM UTC

#### Filter Results
Add query parameters to the curl command:
```bash
# Only pending requests
"${SUPABASE_URL}/rest/v1/version_requests?select=*&status=eq.pending"

# Requests from today
"${SUPABASE_URL}/rest/v1/version_requests?select=*&created_at=gte.$(date -I)"

# High priority requests
"${SUPABASE_URL}/rest/v1/version_requests?select=*&urgency=eq.high"
```

#### Add Notifications
You can integrate with ntfy.sh (already used in your app):
```yaml
- name: Send notification
  run: |
    count=$(cat version_requests_report.json | jq 'length')
    curl -d "Daily check: $count version requests found" \
      https://ntfy.sh/iec-deployment-status
```

### Troubleshooting

**Workflow not running:**
- Check that secrets are properly set
- Verify the workflow file is in `.github/workflows/` directory
- Check Actions tab for any errors

**Authentication errors:**
- Verify SUPABASE_URL and SUPABASE_ANON_KEY secrets are correct
- Ensure the anon key has read permissions for the table

**No data returned:**
- Check that the table name is correct (`version_requests`)
- Verify table has RLS policies that allow anonymous read access
- Test the query manually in Supabase dashboard
