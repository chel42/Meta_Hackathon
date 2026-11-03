from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from app.schemas.agents import Investigation, SourceCheck


def normalize_url(url: str) -> str:
    parts = urlsplit(url)
    query = urlencode(
        [(key, value) for key, value in parse_qsl(parts.query) if not key.lower().startswith("utm_")]
    )
    path = parts.path.rstrip("/")
    return urlunsplit((parts.scheme.lower(), parts.netloc.lower(), path, query, ""))


class SourceVerifier:
    def verify(
        self, investigation: Investigation, source_id_prefix: str = ""
    ) -> list[SourceCheck]:
        results = {
            normalize_url(str(result.url)): result
            for result in investigation.raw_results
        }
        checks: list[SourceCheck] = []
        seen: set[str] = set()
        for citation in investigation.citations:
            url = str(citation.url)
            normalized = normalize_url(url)
            if normalized in seen:
                continue
            seen.add(normalized)
            result = results.get(normalized)
            checks.append(
                SourceCheck(
                    source_id=f"{source_id_prefix}s{len(checks) + 1}",
                    url=url,
                    title=(result.title if result else citation.title),
                    status="confirmed" if result else "not_confirmed",
                    snippet=result.snippet if result else "",
                )
            )
        return checks
