/**
 * @file steering.ts
 * @module @aetheria/engine/ai/steering
 * @description Autonomous steering behaviors: seek, flee, arrive, wander, obstacle avoidance, and flocking.
 */

import type { Vec3 } from '../types/transform.types.js';

export interface SteeringAgent {
  position: Vec3;
  velocity: Vec3;
  maxSpeed: number;
  maxForce: number;
}

export class Steering {
  private static wanderAngle = 0;

  public static seek(agent: SteeringAgent, target: Vec3): Vec3 {
    const desired = {
      x: target.x - agent.position.x,
      y: target.y - agent.position.y,
      z: target.z - agent.position.z,
    };
    const dist = Math.hypot(desired.x, desired.y, desired.z) || 1;
    desired.x = (desired.x / dist) * agent.maxSpeed;
    desired.y = (desired.y / dist) * agent.maxSpeed;
    desired.z = (desired.z / dist) * agent.maxSpeed;

    return this.limitForce({
      x: desired.x - agent.velocity.x,
      y: desired.y - agent.velocity.y,
      z: desired.z - agent.velocity.z,
    }, agent.maxForce);
  }

  public static flee(agent: SteeringAgent, threat: Vec3): Vec3 {
    const seekForce = this.seek(agent, threat);
    return {
      x: -seekForce.x,
      y: -seekForce.y,
      z: -seekForce.z,
    };
  }

  public static arrive(agent: SteeringAgent, target: Vec3, slowingRadius: number = 5.0): Vec3 {
    const desired = {
      x: target.x - agent.position.x,
      y: target.y - agent.position.y,
      z: target.z - agent.position.z,
    };
    const dist = Math.hypot(desired.x, desired.y, desired.z);
    if (dist < 0.001) return { x: 0, y: 0, z: 0 };

    const speed = dist < slowingRadius ? (dist / slowingRadius) * agent.maxSpeed : agent.maxSpeed;
    desired.x = (desired.x / dist) * speed;
    desired.y = (desired.y / dist) * speed;
    desired.z = (desired.z / dist) * speed;

    return this.limitForce({
      x: desired.x - agent.velocity.x,
      y: desired.y - agent.velocity.y,
      z: desired.z - agent.velocity.z,
    }, agent.maxForce);
  }

  public static wander(agent: SteeringAgent, circleRadius: number = 2.0, circleDistance: number = 4.0, angleChange: number = 0.5): Vec3 {
    this.wanderAngle += (Math.random() - 0.5) * angleChange;

    // Circle center in front of agent
    const velLen = Math.hypot(agent.velocity.x, agent.velocity.z) || 1;
    const forwardX = agent.velocity.x / velLen;
    const forwardZ = agent.velocity.z / velLen;

    const circleCenterX = agent.position.x + forwardX * circleDistance;
    const circleCenterZ = agent.position.z + forwardZ * circleDistance;

    const targetX = circleCenterX + Math.cos(this.wanderAngle) * circleRadius;
    const targetZ = circleCenterZ + Math.sin(this.wanderAngle) * circleRadius;

    return this.seek(agent, { x: targetX, y: agent.position.y, z: targetZ });
  }

  public static separation(agent: SteeringAgent, neighbors: Array<{ position: Vec3 }>, desiredDistance: number = 2.0): Vec3 {
    const steer: Vec3 = { x: 0, y: 0, z: 0 };
    let count = 0;

    for (const n of neighbors) {
      const d = Math.hypot(agent.position.x - n.position.x, agent.position.z - n.position.z);
      if (d > 0 && d < desiredDistance) {
        const diff = {
          x: (agent.position.x - n.position.x) / d,
          y: 0,
          z: (agent.position.z - n.position.z) / d,
        };
        steer.x += diff.x;
        steer.z += diff.z;
        count++;
      }
    }

    if (count > 0) {
      steer.x /= count;
      steer.z /= count;
      const len = Math.hypot(steer.x, steer.z) || 1;
      steer.x = (steer.x / len) * agent.maxSpeed;
      steer.z = (steer.z / len) * agent.maxSpeed;
      return this.limitForce(steer, agent.maxForce);
    }

    return { x: 0, y: 0, z: 0 };
  }

  public static alignment(agent: SteeringAgent, neighbors: Array<{ velocity: Vec3 }>): Vec3 {
    const avgVel: Vec3 = { x: 0, y: 0, z: 0 };
    if (neighbors.length === 0) return avgVel;

    for (const n of neighbors) {
      avgVel.x += n.velocity.x;
      avgVel.y += n.velocity.y;
      avgVel.z += n.velocity.z;
    }

    avgVel.x /= neighbors.length;
    avgVel.y /= neighbors.length;
    avgVel.z /= neighbors.length;

    const len = Math.hypot(avgVel.x, avgVel.y, avgVel.z) || 1;
    avgVel.x = (avgVel.x / len) * agent.maxSpeed;
    avgVel.y = (avgVel.y / len) * agent.maxSpeed;
    avgVel.z = (avgVel.z / len) * agent.maxSpeed;

    return this.limitForce({
      x: avgVel.x - agent.velocity.x,
      y: avgVel.y - agent.velocity.y,
      z: avgVel.z - agent.velocity.z,
    }, agent.maxForce);
  }

  public static cohesion(agent: SteeringAgent, neighbors: Array<{ position: Vec3 }>): Vec3 {
    const centerOfMass: Vec3 = { x: 0, y: 0, z: 0 };
    if (neighbors.length === 0) return centerOfMass;

    for (const n of neighbors) {
      centerOfMass.x += n.position.x;
      centerOfMass.y += n.position.y;
      centerOfMass.z += n.position.z;
    }

    centerOfMass.x /= neighbors.length;
    centerOfMass.y /= neighbors.length;
    centerOfMass.z /= neighbors.length;

    return this.seek(agent, centerOfMass);
  }

  private static limitForce(force: Vec3, maxForce: number): Vec3 {
    const mag = Math.hypot(force.x, force.y, force.z);
    if (mag > maxForce) {
      return {
        x: (force.x / mag) * maxForce,
        y: (force.y / mag) * maxForce,
        z: (force.z / mag) * maxForce,
      };
    }
    return force;
  }
}
