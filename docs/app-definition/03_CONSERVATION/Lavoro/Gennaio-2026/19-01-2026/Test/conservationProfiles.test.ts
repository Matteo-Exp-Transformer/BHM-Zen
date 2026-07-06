import { describe, it, expect } from 'vitest'
import {
  getProfileById,
  getProfilesForAppliance,
  mapCategoryIdsToDbNames,
  CONSERVATION_PROFILES,
  CATEGORY_ID_TO_DB_NAME,
  type ApplianceCategory,
  type ConservationProfileId,
} from '../conservationProfiles'

describe('conservationProfiles', () => {
  describe('getProfileById', () => {
    it('returns profile for valid id and category', () => {
      const profile = getProfileById('max_capacity', 'vertical_fridge_with_freezer')
      
      expect(profile).not.toBeNull()
      expect(profile?.profileId).toBe('max_capacity')
      expect(profile?.name).toBe('Profilo Massima Capienza')
      expect(profile?.applianceType).toBe('Frigorifero verticale con Freezer')
      expect(profile?.recommendedSetPointsC.fridge).toBe(2)
      expect(profile?.recommendedSetPointsC.freezer).toBe(-18)
    })

    it('returns null for invalid id', () => {
      const profile = getProfileById('invalid_profile' as ConservationProfileId, 'vertical_fridge_with_freezer')
      
      expect(profile).toBeNull()
    })

    it('returns null for invalid category', () => {
      // Using a type assertion to test invalid category
      const profile = getProfileById('max_capacity', 'invalid_category' as ApplianceCategory)
      
      expect(profile).toBeNull()
    })

    it('returns correct profile for meat_generic', () => {
      const profile = getProfileById('meat_generic', 'vertical_fridge_with_freezer')
      
      expect(profile).not.toBeNull()
      expect(profile?.profileId).toBe('meat_generic')
      expect(profile?.name).toBe('Profilo Carne + Generico')
      expect(profile?.recommendedSetPointsC.fridge).toBe(3)
    })

    it('returns correct profile for vegetables_generic', () => {
      const profile = getProfileById('vegetables_generic', 'vertical_fridge_with_freezer')
      
      expect(profile).not.toBeNull()
      expect(profile?.profileId).toBe('vegetables_generic')
      expect(profile?.name).toBe('Profilo Verdure + Generico')
      expect(profile?.recommendedSetPointsC.fridge).toBe(4)
    })

    it('returns correct profile for fish_generic', () => {
      const profile = getProfileById('fish_generic', 'vertical_fridge_with_freezer')
      
      expect(profile).not.toBeNull()
      expect(profile?.profileId).toBe('fish_generic')
      expect(profile?.name).toBe('Profilo Pesce + Generico')
      expect(profile?.recommendedSetPointsC.fridge).toBe(1)
    })

    it('returns correct profile for meat_fish_generic', () => {
      const profile = getProfileById('meat_fish_generic', 'vertical_fridge_with_freezer')
      
      expect(profile).not.toBeNull()
      expect(profile?.profileId).toBe('meat_fish_generic')
      expect(profile?.name).toBe('Profilo Carne + Pesce + Generico')
      expect(profile?.recommendedSetPointsC.fridge).toBe(2)
    })
  })

  describe('getProfilesForAppliance', () => {
    it('returns 5 profiles for vertical_fridge_with_freezer', () => {
      const profiles = getProfilesForAppliance('vertical_fridge_with_freezer')
      
      expect(profiles).toHaveLength(5)
      expect(profiles.map(p => p.profileId)).toEqual([
        'max_capacity',
        'meat_generic',
        'vegetables_generic',
        'fish_generic',
        'meat_fish_generic',
      ])
    })

    it('returns empty array for invalid appliance category', () => {
      const profiles = getProfilesForAppliance('invalid_category' as ApplianceCategory)
      
      expect(profiles).toEqual([])
    })

    it('returns profiles with correct structure', () => {
      const profiles = getProfilesForAppliance('vertical_fridge_with_freezer')
      
      profiles.forEach(profile => {
        expect(profile).toHaveProperty('profileId')
        expect(profile).toHaveProperty('name')
        expect(profile).toHaveProperty('applianceType')
        expect(profile).toHaveProperty('recommendedSetPointsC')
        expect(profile).toHaveProperty('allowedCategoryIds')
        expect(profile).toHaveProperty('compartmentFill')
        expect(profile).toHaveProperty('haccpNotes')
        expect(Array.isArray(profile.allowedCategoryIds)).toBe(true)
        expect(Array.isArray(profile.haccpNotes)).toBe(true)
        expect(typeof profile.recommendedSetPointsC.fridge).toBe('number')
      })
    })
  })

  describe('mapCategoryIdsToDbNames', () => {
    it('maps all category ids correctly', () => {
      const categoryIds = ['rte', 'dairy', 'eggs', 'raw_meat', 'raw_fish']
      const dbNames = mapCategoryIdsToDbNames(categoryIds)
      
      expect(dbNames).toEqual([
        'Preparazioni/Pronti/Cotti (RTE)',
        'Latticini',
        'Uova',
        'Carni crude',
        'Pesce e frutti di mare crudi',
      ])
    })

    it('filters out unknown ids', () => {
      const categoryIds = ['rte', 'unknown_category', 'dairy', 'another_unknown']
      const dbNames = mapCategoryIdsToDbNames(categoryIds)
      
      expect(dbNames).toEqual([
        'Preparazioni/Pronti/Cotti (RTE)',
        'Latticini',
      ])
      expect(dbNames).not.toContain('unknown_category')
      expect(dbNames).not.toContain('another_unknown')
    })

    it('returns empty array for empty input', () => {
      const dbNames = mapCategoryIdsToDbNames([])
      
      expect(dbNames).toEqual([])
    })

    it('returns empty array when all ids are unknown', () => {
      const categoryIds = ['unknown1', 'unknown2', 'unknown3']
      const dbNames = mapCategoryIdsToDbNames(categoryIds)
      
      expect(dbNames).toEqual([])
    })

    it('maps all known category ids from CATEGORY_ID_TO_DB_NAME', () => {
      const allCategoryIds = Object.keys(CATEGORY_ID_TO_DB_NAME)
      const dbNames = mapCategoryIdsToDbNames(allCategoryIds)
      
      expect(dbNames).toHaveLength(allCategoryIds.length)
      expect(dbNames).toEqual(Object.values(CATEGORY_ID_TO_DB_NAME))
    })

    it('preserves order of input array', () => {
      const categoryIds = ['produce', 'dairy', 'rte']
      const dbNames = mapCategoryIdsToDbNames(categoryIds)
      
      expect(dbNames[0]).toBe('Verdure e ortofrutta')
      expect(dbNames[1]).toBe('Latticini')
      expect(dbNames[2]).toBe('Preparazioni/Pronti/Cotti (RTE)')
    })
  })
})
