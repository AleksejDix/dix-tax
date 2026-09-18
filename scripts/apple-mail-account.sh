#!/usr/bin/env bash
#
# Adds a Migadu mailbox to Apple Mail on macOS.
#
# Mail.app cannot be scripted into creating an account: its AppleScript dictionary has no way
# to make one. The supported route is a configuration profile, which macOS installs and Mail
# then picks up. That is what this writes.
#
# The password is deliberately not in the file. macOS asks for it during installation, so
# nothing secret is written to disk here, and nothing secret can end up in this repository.
#
# Server settings come from Migadu's own autoconfiguration
# (https://admin.migadu.com/mail/config-v1.1.xml): IMAP over SSL on 993, SMTP over SSL on 465,
# and the full address as the username for both.
#
# Usage:
#   scripts/apple-mail-account.sh hello@dix.tax
#   scripts/apple-mail-account.sh forms@dix.tax "dix.tax forms"
#   scripts/apple-mail-account.sh hello@dix.tax --dry-run   # write it, do not open it

set -euo pipefail

IMAP_HOST='imap.migadu.com'
IMAP_PORT=993
SMTP_HOST='smtp.migadu.com'
SMTP_PORT=465

ADDRESS=''
DISPLAY_NAME=''
DRY_RUN=0

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    -*) echo "unknown option: $arg" >&2; exit 64 ;;
    *) if [ -z "$ADDRESS" ]; then ADDRESS="$arg"; else DISPLAY_NAME="$arg"; fi ;;
  esac
done

if [ -z "$ADDRESS" ]; then
  echo "usage: $(basename "$0") <address> [\"Display name\"] [--dry-run]" >&2
  echo "   eg: $(basename "$0") hello@dix.tax \"dix.tax\"" >&2
  exit 64
fi

case "$ADDRESS" in
  *@*.*) ;;
  *) echo "that does not look like an email address: $ADDRESS" >&2; exit 64 ;;
esac

[ -z "$DISPLAY_NAME" ] && DISPLAY_NAME="$ADDRESS"

# Anything that reaches the XML has to survive being XML.
escape() { printf '%s' "$1" | sed -e 's/&/\&amp;/g' -e 's/</\&lt;/g' -e 's/>/\&gt;/g'; }
ADDRESS_X=$(escape "$ADDRESS")
DISPLAY_X=$(escape "$DISPLAY_NAME")
SLUG=$(printf '%s' "$ADDRESS" | tr '[:upper:]@.' '[:lower:]--')

DIR=$(mktemp -d)
PROFILE="$DIR/$SLUG.mobileconfig"

cat > "$PROFILE" <<XML
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadContent</key>
  <array>
    <dict>
      <key>PayloadType</key><string>com.apple.mail.managed</string>
      <key>PayloadVersion</key><integer>1</integer>
      <key>PayloadIdentifier</key><string>tax.dix.mail.$SLUG</string>
      <key>PayloadUUID</key><string>$(uuidgen)</string>
      <key>PayloadDisplayName</key><string>$ADDRESS_X</string>
      <key>EmailAccountDescription</key><string>$DISPLAY_X</string>
      <key>EmailAccountName</key><string>$DISPLAY_X</string>
      <key>EmailAccountType</key><string>EmailTypeIMAP</string>
      <key>EmailAddress</key><string>$ADDRESS_X</string>
      <key>IncomingMailServerHostName</key><string>$IMAP_HOST</string>
      <key>IncomingMailServerPortNumber</key><integer>$IMAP_PORT</integer>
      <key>IncomingMailServerUseSSL</key><true/>
      <key>IncomingMailServerUsername</key><string>$ADDRESS_X</string>
      <key>IncomingMailServerAuthentication</key><string>EmailAuthPassword</string>
      <key>OutgoingMailServerHostName</key><string>$SMTP_HOST</string>
      <key>OutgoingMailServerPortNumber</key><integer>$SMTP_PORT</integer>
      <key>OutgoingMailServerUseSSL</key><true/>
      <key>OutgoingMailServerUsername</key><string>$ADDRESS_X</string>
      <key>OutgoingMailServerAuthentication</key><string>EmailAuthPassword</string>
      <key>OutgoingPasswordSameAsIncomingPassword</key><true/>
    </dict>
  </array>
  <key>PayloadDisplayName</key><string>Mail: $ADDRESS_X</string>
  <key>PayloadIdentifier</key><string>tax.dix.mail.$SLUG.profile</string>
  <key>PayloadOrganization</key><string>dix.tax</string>
  <key>PayloadType</key><string>Configuration</string>
  <key>PayloadUUID</key><string>$(uuidgen)</string>
  <key>PayloadVersion</key><integer>1</integer>
  <key>PayloadScope</key><string>User</string>
  <key>PayloadRemovalDisallowed</key><false/>
</dict>
</plist>
XML

# A malformed profile fails silently in System Settings, so check it here instead.
plutil -lint "$PROFILE" > /dev/null

echo "Profile written: $PROFILE"
echo "  account   $ADDRESS"
echo "  incoming  $IMAP_HOST:$IMAP_PORT over SSL"
echo "  outgoing  $SMTP_HOST:$SMTP_PORT over SSL"
echo "  password  not in the file: macOS will ask for it"

if [ "$DRY_RUN" -eq 1 ]; then
  echo
  echo "Dry run, not opening it."
  exit 0
fi

open "$PROFILE"

cat <<'NEXT'

macOS has taken the profile. To finish:
  System Settings, General, Device Management, then open the downloaded profile
  and press Install. It asks for your Mac password, then for the mailbox password.

Mail picks the account up by itself once the profile is installed. If the mailbox
password is wrong, Mail will ask again rather than fail silently.
NEXT
