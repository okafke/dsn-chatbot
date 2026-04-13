/**
 * Robot Sprite Registration
 *
 * This is the single place where all robot sprite images are imported and
 * registered with the animation service.
 *
 * ## Adding a new mood or action
 *
 * 1. Add the image files to `src/assets/` following the naming convention:
 *      {mood}_robot.png                          → idle / eyes open
 *      {mood}_robot_eyes_closed.png              → idle / eyes closed
 *      {mood}_robot_{action}.png                 → {action} / eyes open
 *      {mood}_robot_{action}_eyes_closed.png     → {action} / eyes closed
 *
 * 2. Import them below and call `registerSprite()`.
 *
 * 3. Optionally register idle behaviours with `registerIdleBehaviour()`.
 */

import {
    registerSprite,
    registerIdleBehaviour,
} from './robotAnimation'

// ── Sad mood sprites ────────────────────────────────────────────────────────

import sadIdleOpen from '../assets/sad_robot.png'
import sadIdleClosed from '../assets/sad_robot_eyes_closed.png'

registerSprite('sad', 'idle', 'open', sadIdleOpen)
registerSprite('sad', 'idle', 'closed', sadIdleClosed)

// If you add sad_robot_speaking.png / sad_robot_speaking_eyes_closed.png:
// import sadSpeakingOpen from '../assets/sad_robot_speaking.png'
// import sadSpeakingClosed from '../assets/sad_robot_speaking_eyes_closed.png'
// registerSprite('sad', 'speaking', 'open', sadSpeakingOpen)
// registerSprite('sad', 'speaking', 'closed', sadSpeakingClosed)

// If you add sad_robot_head_tilted.png / sad_robot_head_tilted_eyes_closed.png:
// import sadHeadTiltOpen from '../assets/sad_robot_head_tilted.png'
// import sadHeadTiltClosed from '../assets/sad_robot_head_tilted_eyes_closed.png'
// registerSprite('sad', 'head_tilt', 'open', sadHeadTiltOpen)
// registerSprite('sad', 'head_tilt', 'closed', sadHeadTiltClosed)

// ── Slightly happy mood sprites ─────────────────────────────────────────────

import slightlyHappyIdleOpen from '../assets/slightly_happy_robot.png'
import slightlyHappyIdleClosed from '../assets/slightly_happy_robot_eyes_closed.png'

registerSprite('slightly_happy', 'idle', 'open', slightlyHappyIdleOpen)
registerSprite('slightly_happy', 'idle', 'closed', slightlyHappyIdleClosed)

// If you add slightly_happy_robot_speaking.png / …_eyes_closed.png:
// import shSpeakingOpen from '../assets/slightly_happy_robot_speaking.png'
// import shSpeakingClosed from '../assets/slightly_happy_robot_speaking_eyes_closed.png'
// registerSprite('slightly_happy', 'speaking', 'open', shSpeakingOpen)
// registerSprite('slightly_happy', 'speaking', 'closed', shSpeakingClosed)

// ── Idle Behaviours ─────────────────────────────────────────────────────────
// These fire at random intervals when the robot is idle.
// Uncomment when you have the head_tilt sprites:

// registerIdleBehaviour('sad', {
//     action: 'head_tilt',
//     durationMs: 1500,
//     minIntervalMs: 5000,
//     maxIntervalMs: 10000,
// })

// registerIdleBehaviour('slightly_happy', {
//     action: 'head_tilt',
//     durationMs: 1200,
//     minIntervalMs: 4000,
//     maxIntervalMs: 8000,
// })
