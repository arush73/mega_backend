import mongoose from "mongoose"
import dotenv from "dotenv"
import { User } from "./models/user.models.js"
import { Cohort } from "./models/cohort.models.js"
import { Team } from "./models/team.models.js"
import { Chat } from "./models/chat.models.js"
import { Message } from "./models/message.models.js"

dotenv.config()

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/team_builder_saas"

// Dummy data
const dummyUsers = [
  {
    username: "admin_user",
    email: "admin@clarityhub.com",
    password: "Admin@123",
    role: "ADMIN",
    isEmailVerified: true,
  },
  {
    username: "john_doe",
    email: "john@example.com",
    password: "User@123",
    role: "USER",
    isEmailVerified: true,
  },
  {
    username: "jane_smith",
    email: "jane@example.com",
    password: "User@123",
    role: "USER",
    isEmailVerified: true,
  },
  {
    username: "bob_wilson",
    email: "bob@example.com",
    password: "User@123",
    role: "USER",
    isEmailVerified: true,
  },
  {
    username: "alice_johnson",
    email: "alice@example.com",
    password: "User@123",
    role: "USER",
    isEmailVerified: true,
  },
]

const dummyCohorts = [
  {
    name: "Web Development Bootcamp 2024",
    description: "Full-stack web development cohort",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-06-30"),
    isActive: true,
  },
  {
    name: "Data Science Cohort",
    description: "Machine learning and data analytics",
    startDate: new Date("2024-02-01"),
    endDate: new Date("2024-07-31"),
    isActive: true,
  },
]

const dummyTeams = [
  {
    name: "Frontend Wizards",
    description: "Building amazing user interfaces",
  },
  {
    name: "Backend Ninjas",
    description: "Crafting robust APIs and databases",
  },
  {
    name: "Full Stack Heroes",
    description: "End-to-end application development",
  },
]

const dummyMessages = [
  "Hey everyone! Welcome to the chat! 👋",
  "Looking forward to working with you all! 🚀",
  "Does anyone have experience with React?",
  "I've been working with React for 2 years now, happy to help!",
  "That's awesome! Can you share some best practices?",
  "Sure! Always use functional components and hooks 💡",
  "What about state management? Redux or Context API?",
  "For small apps, Context API is fine. For larger apps, consider Redux or Zustand",
  "Thanks for the tips! Really helpful 🙏",
  "No problem! Feel free to ask anytime 😊",
  "Anyone working on the project this weekend?",
  "I'll be working on the authentication module",
  "Great! I'll focus on the UI components then",
  "Let's sync up on Monday to integrate everything",
  "Sounds good! See you all Monday ✨",
]

async function seedDatabase() {
  try {
    console.log("🌱 Starting database seeding...")

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log("✅ Connected to MongoDB")

    // Clear existing data
    console.log("🗑️  Clearing existing data...")
    await User.deleteMany({})
    await Cohort.deleteMany({})
    await Team.deleteMany({})
    await Chat.deleteMany({})
    await Message.deleteMany({})
    console.log("✅ Existing data cleared")

    // Create users
    console.log("👥 Creating users...")
    const users = []
    for (const userData of dummyUsers) {
      const user = await User.create(userData)
      users.push(user)
      console.log(`   ✓ Created user: ${user.username}`)
    }

    // Create cohorts with members
    console.log("🎓 Creating cohorts...")
    const cohorts = []
    for (const cohortData of dummyCohorts) {
      const cohort = await Cohort.create({
        ...cohortData,
        members: users.slice(0, 4).map((u) => u._id), // Add first 4 users to each cohort
      })
      cohorts.push(cohort)
      console.log(`   ✓ Created cohort: ${cohort.name}`)
    }

    // Update users with cohort references
    for (const user of users.slice(0, 4)) {
      user.cohort = cohorts.map((c) => ({
        name: c.name,
        id: c._id,
      }))
      await user.save()
    }

    // Create teams with members
    console.log("👨‍💻 Creating teams...")
    const teams = []
    for (let i = 0; i < dummyTeams.length; i++) {
      const teamData = dummyTeams[i]
      const teamMembers = users.slice(i, i + 3) // Different members for each team
      const team = await Team.create({
        ...teamData,
        members: teamMembers.map((u) => u._id),
        admin: [teamMembers[0]._id],
        leaders: [teamMembers[1]._id],
      })
      teams.push(team)
      console.log(`   ✓ Created team: ${team.name}`)

      // Update users with team references
      for (const user of teamMembers) {
        if (!user.teams) user.teams = []
        user.teams.push({
          name: team.name,
          id: team._id,
        })
        await user.save()
      }
    }

    // Create chats for cohorts
    console.log("💬 Creating cohort chats...")
    const cohortChats = []
    for (const cohort of cohorts) {
      const chat = await Chat.create({
        name: cohort.name,
        chatType: "COHORT",
        isGroupChat: true,
        participants: cohort.members,
        admin: users[0]._id, // Admin user
      })
      cohortChats.push(chat)
      console.log(`   ✓ Created chat for cohort: ${cohort.name}`)
    }

    // Create chats for teams
    console.log("💬 Creating team chats...")
    const teamChats = []
    for (const team of teams) {
      const chat = await Chat.create({
        name: team.name,
        chatType: "TEAM",
        isGroupChat: true,
        participants: team.members,
        admin: team.admin[0],
      })
      teamChats.push(chat)
      console.log(`   ✓ Created chat for team: ${team.name}`)
    }

    // Create messages for each chat
    console.log("📝 Creating messages...")
    const allChats = [...cohortChats, ...teamChats]

    for (const chat of allChats) {
      const chatMessages = []
      const numMessages = Math.floor(Math.random() * 5) + 5 // 5-10 messages per chat

      for (let i = 0; i < numMessages; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)]
        const randomMessageText =
          dummyMessages[Math.floor(Math.random() * dummyMessages.length)]

        const message = await Message.create({
          sender: randomUser._id,
          content: randomMessageText,
          chat: chat._id,
          attachments: [],
        })
        chatMessages.push(message)

        // Add small delay to ensure different timestamps
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      // Update chat with last message
      if (chatMessages.length > 0) {
        chat.lastMessage = chatMessages[chatMessages.length - 1]._id
        await chat.save()
      }

      console.log(
        `   ✓ Created ${chatMessages.length} messages for: ${chat.name}`
      )
    }

    console.log("\n🎉 Database seeding completed successfully!")
    console.log("\n📊 Summary:")
    console.log(`   👥 Users: ${users.length}`)
    console.log(`   🎓 Cohorts: ${cohorts.length}`)
    console.log(`   👨‍💻 Teams: ${teams.length}`)
    console.log(`   💬 Chats: ${allChats.length}`)
    console.log(`   📝 Total Messages: ${await Message.countDocuments()}`)

    console.log("\n🔑 Test Credentials:")
    console.log("   Admin: admin@clarityhub.com / Admin@123")
    console.log("   User 1: john@example.com / User@123")
    console.log("   User 2: jane@example.com / User@123")
    console.log("   User 3: bob@example.com / User@123")
    console.log("   User 4: alice@example.com / User@123")
  } catch (error) {
    console.error("❌ Error seeding database:", error)
  } finally {
    await mongoose.disconnect()
    console.log("\n✅ Disconnected from MongoDB")
    process.exit(0)
  }
}

// Run the seed function
seedDatabase()
