export const DB_NAME = "team_builder_saas"

export const UserRolesEnum = {
  ADMIN: "ADMIN",
  USER: "USER",
}

export const AvailableUserRoles = Object.values(UserRolesEnum)

export const USER_TEMPORARY_TOKEN_EXPIRY = 20 * 60 * 1000

export const UserLoginType = {
  GOOGLE: "GOOGLE",
  GITHUB: "GITHUB",
  EMAIL_PASSWORD: "EMAIL_PASSWORD",
}

export const AvailableSocialLogins = Object.values(UserLoginType)

export const TeamJoinRequestStatus = {
  PENDING: "PENDING",
  ACCEPTED: "ACCEPTED",
  REJECTED: "REJECTED",
}

export const AvailableTeamJoinRequestStatus = Object.values(
  TeamJoinRequestStatus
)

export const FeedbackType = {
  FEEDBACK: "FEEDBACK",
  SUGGESTION: "SUGGESTION",
  BUG: "BUG",
}

export const AvailableFeedbackType = Object.values(FeedbackType)

export const LanguageCode = {
  71: "PYTHON",
  63: "JAVASCRIPT",
  62: "JAVA",
  54: "C++",
}

export const AvailableLanguages = Object.values(LanguageCode)

/**
 * @description set of events that we are using in chat app. more to be added as we develop the chat app
 */
export const ChatEventEnum = Object.freeze({
  // ? once user is ready to go
  CONNECTED_EVENT: "connected",
  // ? when user gets disconnected
  DISCONNECT_EVENT: "disconnect",
  // ? when user joins a socket room
  JOIN_CHAT_EVENT: "joinChat",
  // ? when participant gets removed from group, chat gets deleted or leaves a group
  LEAVE_CHAT_EVENT: "leaveChat",
  // ? when admin updates a group name
  UPDATE_GROUP_NAME_EVENT: "updateGroupName",
  // ? when new message is received
  MESSAGE_RECEIVED_EVENT: "messageReceived",
  // ? when there is new one on one chat, new group chat or user gets added in the group
  NEW_CHAT_EVENT: "newChat",
  // ? when there is an error in socket
  SOCKET_ERROR_EVENT: "socketError",
  // ? when participant stops typing
  STOP_TYPING_EVENT: "stopTyping",
  // ? when participant starts typing
  TYPING_EVENT: "typing",
  // ? when message is deleted
  MESSAGE_DELETE_EVENT: "messageDeleted",
})

export const AvailableChatEvents = Object.values(ChatEventEnum)

export const ChatTypeEnum = {
  ONE_ON_ONE: "ONE_ON_ONE",
  TEAM: "TEAM",
  COHORT: "COHORT",
}

export const AvailableChatTypes = Object.values(ChatTypeEnum)

export const ChannelTypeEnum = {
  TEXT: "TEXT",
  VOICE: "VOICE",
}

export const AvailableChannelTypes = Object.values(ChannelTypeEnum)

export const UserPronounsEnum = {
  MALE: "HE/HIM/HIS",
  FEMALE: "SHE/HER/HERS",
  NON_BINARY: "THEY/THEM/THEIRS",
}

export const AvailableUserPronouns = Object.values(UserPronounsEnum)

export const profileAvailabilityEnum = {
  AVAILABLE: "AVAILABLE",
  BUSY: "BUSY",
  MAYBE: "MAYBE",
}

export const AvailableProfileAvailability = Object.values(
  profileAvailabilityEnum
)

export const UserProfileSkillsEnum = {
  REACT: "REACT",
  NODE: "NODE",
  PYTHON: "PYTHON",
  JAVASCRIPT: "JAVASCRIPT",
  TYPESCRIPT: "TYPESCRIPT",
  DOCKER: "DOCKER",
}

export const AvailableUserProfileSkills = Object.values(UserProfileSkillsEnum)

const CohortChannelTypeEnum = {
  VOICE: "VOICE",
  TEXT: "TEXT",
}

export const AvailableCohortChannelTypes = Object.values(CohortChannelTypeEnum)
