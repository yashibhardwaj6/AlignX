class EntraIdIntegration:
    """Placeholder boundary for future Microsoft Entra ID SSO and hierarchy sync."""

    def build_authorization_url(self) -> str:
        return "https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize"

    def sync_groups(self) -> dict:
        return {"status": "ready", "message": "Azure AD group sync adapter is not configured yet."}
