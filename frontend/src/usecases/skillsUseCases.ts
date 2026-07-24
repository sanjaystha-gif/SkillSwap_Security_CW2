import {
  createSkill,
  deleteSkill,
  getSkill,
  listMySkills,
  listSkills,
  listUserSkills,
  updateSkill,
} from '../services/skillsService';
import type {
  CreateSkillPayload,
  Skill,
  UpdateSkillPayload,
} from '../services/skillsService';

export function fetchSkillList(): Promise<Skill[]> {
  return listSkills();
}

export function fetchSkillDetail(skillId: string): Promise<Skill> {
  return getSkill(skillId);
}

export function fetchMySkills(accessToken?: string): Promise<Skill[]> {
  return listMySkills(accessToken);
}

export function fetchUserSkills(userId: string): Promise<Skill[]> {
  return listUserSkills(userId);
}

export function submitNewSkill(payload: CreateSkillPayload): Promise<Skill> {
  return createSkill(payload);
}

export function updateExistingSkill(
  skillId: string,
  payload: UpdateSkillPayload
): Promise<Skill> {
  return updateSkill(skillId, payload);
}

export function removeSkill(skillId: string): Promise<void> {
  return deleteSkill(skillId);
}
