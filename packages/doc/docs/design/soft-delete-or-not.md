# Soft Delete, or Not?

## Introduction

In the system, foreign references can be anywhere.

<!-- markdownlint-disable -->
@startuml
class User {}
class Group {}
class AccessItem {}
class Journal {}

Group *-- User: Reverse Cascade
note as NoteGroupUser
  If User is deleted,
  the related entries in Groups
  should be deleted
end note
Group ... NoteGroupUser
NoteGroupUser ... User
AccessItem *-- Group: Reverse Cascade
AccessItem *-- User: Reverse Cascade
Journal *-- AccessItem: Cascade
note as NoteJournalAccessItem
  If Journal is deleted,
  all AccessItems should be deleted
end note
Journal ... NoteJournalAccessItem
NoteJournalAccessItem ... AccessItem
@enduml
<!-- markdownlint-restore -->

The hard/soft delete mechanism is fully communicated
in [this question](https://stackoverflow.com/questions/378331/physical-vs-logical-hard-vs-soft-delete-of-database-record)
and [this blog](https://transang.me/to-delete-or-not-to-delete-practical-data-archive-in-database-design/).

And in my practice, the soft delete may not always work, sometimes the deleted records will still be fetched,
especially in Many-To- relationship. In the normal find page cases, you can simply use `WHERE deleted_at != NULL`
to filter out existing entities, but in Many-To- relationship, you will always get ALL the entities.
