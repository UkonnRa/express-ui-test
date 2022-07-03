# Use Cases

WhiteRabbit is not a professional/serious accounting system, it prefers to handle the daily general journal in a family
and give you a clear report of the financial situation.
Double-entry accounting is a good way to record the financial flow, so WhiteRabbit uses it as the primary strategy.

## Requirements

Here is the feature requirements and system requirements.

### Create

Users can create entities.

<!-- markdownlint-disable -->
@startuml
start

group common
if (authUser does not contain Scope:Write) then (yes)
  :throw NoPermissionError;
  end
elseif (authUser has already been deleted) then (yes)
  :throw NotFoundError;
  end
endif
group create
:Call findOne with the unique filter;
if (entity with any unique key exists) then (yes)
  :throw AlreadyExistsError;
  end
endif
end group
end group

group business-logic
if (conflict with business logic checking) then (yes)
  :throw related errors;
  end
else
  :Create the entity;
endif
end group

stop
@enduml
<!-- markdownlint-restore -->

### Update

Users can update entities.

<!-- markdownlint-disable -->
@startuml
start

group common
if (authUser does not contain Scope:Write) then (yes)
  :throw NoPermissionError;
  end
elseif (authUser has already been deleted) then (yes)
  :throw NotFoundError;
  end
endif
group update
if (authUser is higher than ADMIN) then (yes)
  :Call findOne with ID, including deleted;
else
  :Call findOne with ID;
endif
if (entity not exists) then (yes)
  :throw NotFoundError;
  end
endif
end group
end group

group business-logic
if (conflict with business logic checking) then (yes)
  :throw related errors;
  end
else
  :Update the entity;
endif
end group

stop
@enduml
<!-- markdownlint-restore -->

### Delete

Users can delete entities.

<!-- markdownlint-disable -->
@startuml
start

group common
if (authUser does not contain Scope:Write) then (yes)
  :throw NoPermissionError;
  end
elseif (authUser has already been deleted) then (yes)
  :throw NotFoundError;
  end
endif
group update
if (authUser is higher than ADMIN) then (yes)
  :Call findOne with ID, including deleted;
else
  :Call findOne with ID;
endif
if (entity not exists) then (yes)
  :throw NotFoundError;
  end
endif
end group
end group

group business-logic
if (entity is deleted) then (yes)
  :throw AlreadyDeleted;
  end
else
  :Update deletedAt to now;
  :Update unique keys with a random suffix;
endif
end group

stop
@enduml
<!-- markdownlint-restore -->

### Find All

Users can find all entities based on filters.

<!-- markdownlint-disable -->
@startuml
start

group common
if (authUser does not contain Scope:Read) then (yes)
:throw NoPermissionError;
end
elseif (authUser has already been deleted) then (yes)
:throw NotFoundError;
end
elseif (authUser is not higher than ADMIN && query includes $additional query) then (yes)
:throw NoPermissionError;
end
endif
end group

group business-logic
:Extract additional query and external query;
note right
* additional query: queries from query.$additional, mostly the admin-specific queries
* external query: queries cannot merge with SQL, mostly:
  * isReadable: business-logic specific queries
  * full text: full text searching using external engines like ElasticSearch
end note
:Create SQL query;
repeat :Get a batch result based on SQL query;
  backward :Get the next batch;
  :Filter the batch result based on external queries;
  :Put the filtered batch into result;
repeat while (The result size is larger than the expected size) is (False) not (True)
:Return Page based on the result;

stop
@enduml
<!-- markdownlint-restore -->

### Find One

Users can find one entity based on filters.

<!-- markdownlint-disable -->
@startuml
start

:Call findPage function, with size = 1;
if (Result size == 0) then (yes)
  :return null;
else
  :return result[0];
endif

stop
@enduml
<!-- markdownlint-restore -->

## Authentication Workflow between Frontend and Backend

Since WhiteRabbit has two modes, remote mode and local mode, there are different authentication workflows for each mode.

### Remote Mode: OAuth2

For remote mode, we choose OAuth2 and a third-party OIDC provider. The whole workflow is based on
Auth Code Flow with PKCE, which means the workflow is only on frontend.
And the OIDC client will refresh the access token and id token before their expirations.

<!-- markdownlint-disable -->
@startuml
actor Frontend
participant AuthServer
participant Backend

Frontend -> AuthServer: Sign In Request
AuthServer --> Frontend: Success and to Callback Page
note left
Containing the standard OIDC Sign In
and Consent workflow.
Frontend will get:
* id_token: For proving the authT flow is finished.
* access_token: For proving the authZ flow is finished.
  This should be the Authorization Header between Frontend and Backend.
* refresh_token: Refresh the two tokens silently before expirations.
end note
Frontend -> Backend: Get self by access_token
Backend --> Frontend: Return User or null
alt Returned User is null
  Frontend -> Frontend: Redirect to Register Page
else
  Frontend -> Frontend: Redirect to Home Page
end

Frontend -> Backend: API calls with access_token
Backend -> AuthServer: Require JWKS public keys
AuthServer --> Backend: JWKS public keys
Backend -> Backend: Check the access_token (expiration, issuer, audience, signature, etc)
Backend --> Frontend: The secured data
@enduml
<!-- markdownlint-restore -->

#### access_token and id_token, when to use which?

The only difference between access_token and id_token is that, access_token has the field `scope`, and id_token has
a bunch of personal information fields. For Backend, the most concerned thing is: which permissions the coming user has.
That's what the field `scope` does.

So:
* access_token works for authorization, which contains the permissions authorized by users themselves.
* id_token works for authentication, which contains some userInfo to make Frontend represent the user easily.
  * In our design, the userInfo of id_token is useless since we don't store user info in the third party platform until
    we build own OIDC authorization server.

### Local Mode: Local Password

In local mode, there are no security concerns, so we simply use the explicit password for authentication
and no authorization flows.

<!-- markdownlint-disable -->
@startuml
actor Frontend
participant Backend

Frontend -> Backend: Sign In Request with password
note left
Here, Frontend is the render process
and Backend is the main/business process
end note
Backend -> Backend: Success and to Callback page
note left
**About Authentication:**
Backend will compare the input password
with the **hashed** local password.

**About Callback:**
The callback will only return the ID of the user.
end note
Frontend -> Backend: Get self by ID
Backend --> Frontend: Return User or null
alt Returned User is null
  Frontend -> Frontend: Impossible, Owner is created\nwhen initing the system
else
  Frontend -> Frontend: Redirect to Home Page
end
@enduml
<!-- markdownlint-restore -->

### Class Diagram

<!-- markdownlint-disable -->
@startuml

interface AuthManager {
  + user: UserModel;
  + signIn(): Promise<void>;
  + signInCallback(): Promise<void>;
  + signOut(): Promise<void>;
  + signOutCallback(): Promise<void>;
}

class OIDCAuthManager implements AuthManager {
  - oidcManager: OIDCManager;
}

class LocalAuthManager implements AuthManager {}
@enduml
<!-- markdownlint-restore -->
