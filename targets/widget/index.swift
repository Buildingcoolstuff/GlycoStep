import WidgetKit
import SwiftUI
import AppIntents

private let appGroupId = "group.com.buildingcoolstuff.glycostep"
private let stateKey = "session_state"
public let widgetKind = "GlycoStepWidget"

// Matches TypeScript HabitSession schema in storage.ts
struct HabitSessionPayload: Codable {
    var lastLogTimestamp: Double
    var postMealSteps: Int
    var targetSteps: Int
    var currentStreak: Int
    var mascotMood: String
    var activeWalkStartTime: Double?
    var lastMealType: String?
}

struct HabitWidgetEntry: TimelineEntry {
    let date: Date
    let payload: HabitSessionPayload
}

enum SharedHabitStorage {
    static func load() -> HabitSessionPayload {
        guard let defaults = UserDefaults(suiteName: appGroupId),
              let rawJson = defaults.string(forKey: stateKey),
              let data = rawJson.data(using: .utf8),
              let decoded = try? JSONDecoder().decode(HabitSessionPayload.self, from: data)
        else {
            return HabitSessionPayload(
                lastLogTimestamp: Date().timeIntervalSince1970 * 1000,
                postMealSteps: 0,
                targetSteps: 1500,
                currentStreak: 1,
                mascotMood: "idle",
                activeWalkStartTime: nil,
                lastMealType: "lunch"
            )
        }
        return decoded
    }

    static func save(_ payload: HabitSessionPayload) {
        guard let defaults = UserDefaults(suiteName: appGroupId),
              let encoded = try? JSONEncoder().encode(payload),
              let jsonString = String(data: encoded, encoding: .utf8)
        else { return }

        defaults.set(jsonString, forKey: stateKey)
        // Force immediate paint of all widget instances
        WidgetCenter.shared.reloadTimelines(ofKind: widgetKind)
    }
}

// iOS 17+ Zero-Open Interactive Button Intent
struct LogWalkIntent: AppIntent {
    static var title: LocalizedStringResource = "Log 250 Post-Meal Steps"
    static var description = IntentDescription("Adds 250 steps toward your post-meal glucose stabilization goal.")

    func perform() async throws -> some IntentResult {
        var current = SharedHabitStorage.load()
        let previousSteps = current.postMealSteps
        current.postMealSteps += 250
        current.lastLogTimestamp = Date().timeIntervalSince1970 * 1000

        if current.postMealSteps >= current.targetSteps {
            current.mascotMood = "celebrating"
            if previousSteps < current.targetSteps {
                current.currentStreak += 1
            }
        } else {
            current.mascotMood = "walking"
        }

        SharedHabitStorage.save(current)
        return .result()
    }
}

struct HabitWidgetProvider: TimelineProvider {
    func placeholder(in context: Context) -> HabitWidgetEntry {
        HabitWidgetEntry(date: Date(), payload: SharedHabitStorage.load())
    }

    func getSnapshot(in context: Context, completion: @escaping (HabitWidgetEntry) -> Void) {
        completion(HabitWidgetEntry(date: Date(), payload: SharedHabitStorage.load()))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<HabitWidgetEntry>) -> Void) {
        let entry = HabitWidgetEntry(date: Date(), payload: SharedHabitStorage.load())
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: Date())!
        completion(Timeline(entries: [entry], policy: .after(nextUpdate)))
    }
}

struct GlycoStepWidgetView: View {
    var entry: HabitWidgetEntry

    var progress: Double {
        guard entry.payload.targetSteps > 0 else { return 0 }
        return min(Double(entry.payload.postMealSteps) / Double(entry.payload.targetSteps), 1.0)
    }

    var mascotEmoji: String {
        switch entry.payload.mascotMood {
        case "celebrating": return "🐆" // Cheetah: Spike flattened
        case "walking": return "🐾"     // Active walk
        default: return "🦥"            // Sloth: Sluggish pre-walk
        }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("\(mascotEmoji) 🔥 \(entry.payload.currentStreak)d")
                    .font(.caption)
                    .fontWeight(.bold)
                Spacer()
                Text("\(entry.payload.postMealSteps)/\(entry.payload.targetSteps)")
                    .font(.caption2)
                    .monospacedDigit()
                    .foregroundColor(.secondary)
            }

            ProgressView(value: progress)
                .tint(progress >= 1.0 ? .green : .orange)

            Button(intent: LogWalkIntent()) {
                Label(progress >= 1.0 ? "Spike Flattened!" : "+250 Steps", systemImage: "figure.walk")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .tint(progress >= 1.0 ? .green : .blue)
        }
        .containerBackground(.fill.tertiary, for: .widget)
    }
}

struct GlycoStepWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: widgetKind, provider: HabitWidgetProvider()) { entry in
            GlycoStepWidgetView(entry: entry)
        }
        .configurationDisplayName("GlycoStep Tracker")
        .description("Flatten post-meal glucose spikes directly from your Home Screen.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

@main
struct GlycoStepBundle: WidgetBundle {
    var body: some Widget {
        GlycoStepWidget()
        GlycoStepLiveActivity()
    }
}
