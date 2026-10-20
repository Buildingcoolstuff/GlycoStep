import ActivityKit
import WidgetKit
import SwiftUI

public struct GlycoStepAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        public var currentSteps: Int
        public var targetSteps: Int
        public var remainingMinutes: Int
        public var mascotStage: String // "sloth", "walking", "cheetah"
    }

    public var mealName: String // e.g. "Post-Lunch Walk"
    public var windowEndTime: Date
}

struct GlycoStepLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: GlycoStepAttributes.self) { context in
            // Lock Screen Banner UI
            HStack(spacing: 14) {
                Text(context.state.mascotStage == "cheetah" ? "🐆" : "🦥")
                    .font(.system(size: 34))
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(context.attributes.mealName)
                        .font(.headline)
                        .foregroundColor(.primary)
                    
                    Text("\(context.state.currentSteps) of \(context.state.targetSteps) steps • \(context.state.remainingMinutes)m left")
                        .font(.subheadline)
                        .foregroundColor(.secondary)
                }
                
                Spacer()
                
                ProgressView(value: Double(context.state.currentSteps), total: Double(context.state.targetSteps))
                    .progressViewStyle(.circular)
                    .tint(.green)
            }
            .padding()
            .activityBackgroundTint(Color.black.opacity(0.85))

        } dynamicIsland: { context in
            // Dynamic Island Layout
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Text(context.state.mascotStage == "cheetah" ? "🐆" : "🦥")
                        .font(.title)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text("\(context.state.remainingMinutes)m left")
                        .font(.caption)
                        .monospacedDigit()
                        .foregroundColor(.orange)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    VStack(spacing: 4) {
                        ProgressView(value: Double(context.state.currentSteps), total: Double(context.state.targetSteps))
                            .tint(.green)
                        
                        Text("\(context.state.currentSteps)/\(context.state.targetSteps) steps to flatten spike")
                            .font(.caption2)
                            .foregroundColor(.secondary)
                    }
                }
            } compactLeading: {
                Text(context.state.mascotStage == "cheetah" ? "🐆" : "🦥")
            } compactTrailing: {
                Text("\(context.state.currentSteps)")
                    .font(.caption2)
                    .monospacedDigit()
            } minimal: {
                Text("🐾")
            }
        }
    }
}
