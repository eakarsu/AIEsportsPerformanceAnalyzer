# Governed coaching workflow

`/api/governed-coaching` records consent and source provenance for game API/replay/video/team/wearable imports, calculates versioned reproducible metrics, and gates interventions through coach review. Consent withdrawal is a first-class terminal path; game patch, metric definition, checksum, uncertainty, outcomes, and all transitions are retained in the audit timeline.

Adapters must separately enforce game terms, webhook/API authenticity, data minimization, retention, and minor/guardian consent. Recommendations remain coaching aids and do not create betting advice. Provider access and longitudinal coaching validation remain external work.

Bootstrap, migration, startup, and guarded demo seed are separate scripts.
