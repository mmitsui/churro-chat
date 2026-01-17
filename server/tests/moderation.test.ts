import * as roomService from '../src/services/roomService';
import { UserSession } from '../src/types';

describe('Moderation Functionality', () => {
  let roomId: string;
  let ownerToken: string;
  let user1Session: UserSession;
  let user2Session: UserSession;

  beforeEach(() => {
    roomService.clearAll();
    const room = roomService.createRoom(12);
    roomId = room.id;
    ownerToken = room.ownerToken;

    user1Session = {
      sessionId: 'user1-session',
      roomId,
      nickname: 'User1',
      color: '#FF0000',
      joinedAt: Date.now()
    };

    user2Session = {
      sessionId: 'user2-session',
      roomId,
      nickname: 'User2',
      color: '#00FF00',
      joinedAt: Date.now()
    };
  });

  describe('Owner Authentication', () => {
    it('should verify owner token correctly', () => {
      expect(roomService.verifyOwnerToken(roomId, ownerToken)).toBe(true);
    });

    it('should reject invalid owner token', () => {
      expect(roomService.verifyOwnerToken(roomId, 'wrong-token')).toBe(false);
    });

    it('should reject owner token for non-existent room', () => {
      expect(roomService.verifyOwnerToken('nonexistent', ownerToken)).toBe(false);
    });
  });

  describe('Eject User', () => {
    beforeEach(() => {
      roomService.addSession(roomId, user1Session);
      roomService.addSession(roomId, user2Session);
    });

    it('should eject a user from the room', () => {
      expect(roomService.getParticipantCount(roomId)).toBe(2);
      
      const ejected = roomService.ejectUser(roomId, user1Session.sessionId);
      expect(ejected).toBeDefined();
      expect(ejected!.sessionId).toBe(user1Session.sessionId);
      expect(roomService.getParticipantCount(roomId)).toBe(1);
      expect(roomService.getSession(roomId, user1Session.sessionId)).toBeNull();
    });

    it('should not allow ejecting non-existent user', () => {
      const ejected = roomService.ejectUser(roomId, 'nonexistent-session');
      expect(ejected).toBeNull();
      expect(roomService.getParticipantCount(roomId)).toBe(2);
    });

    it('should eject user but not ban them', () => {
      roomService.ejectUser(roomId, user1Session.sessionId);
      expect(roomService.isUserBanned(roomId, user1Session.sessionId)).toBe(false);
      
      // User should be able to rejoin after ejection (not banned)
      const canRejoin = roomService.addSession(roomId, user1Session);
      expect(canRejoin).toBe(true);
    });
  });

  describe('Ban User', () => {
    beforeEach(() => {
      roomService.addSession(roomId, user1Session);
      roomService.addSession(roomId, user2Session);
    });

    it('should ban a user from the room', () => {
      expect(roomService.getParticipantCount(roomId)).toBe(2);
      
      const banned = roomService.banUser(roomId, user1Session.sessionId);
      expect(banned).toBe(true);
      expect(roomService.isUserBanned(roomId, user1Session.sessionId)).toBe(true);
      expect(roomService.getParticipantCount(roomId)).toBe(1); // Should also remove session
    });

    it('should prevent banned user from rejoining', () => {
      roomService.banUser(roomId, user1Session.sessionId);
      
      // Try to rejoin
      const canRejoin = roomService.addSession(roomId, user1Session);
      expect(canRejoin).toBe(false);
      expect(roomService.isSessionBanned(roomId, user1Session.sessionId)).toBe(true);
    });

    it('should not allow banning non-existent user', () => {
      const banned = roomService.banUser(roomId, 'nonexistent-session');
      expect(banned).toBe(true); // Ban still succeeds, but user wasn't in room
      expect(roomService.isUserBanned(roomId, 'nonexistent-session')).toBe(true);
    });

    it('should remove user from room when banning', () => {
      expect(roomService.getParticipantCount(roomId)).toBe(2);
      roomService.banUser(roomId, user1Session.sessionId);
      expect(roomService.getParticipantCount(roomId)).toBe(1);
      expect(roomService.getSession(roomId, user1Session.sessionId)).toBeNull();
    });
  });

  describe('Ban vs Eject', () => {
    beforeEach(() => {
      roomService.addSession(roomId, user1Session);
    });

    it('should distinguish between eject and ban', () => {
      // Eject user1
      roomService.ejectUser(roomId, user1Session.sessionId);
      expect(roomService.isUserBanned(roomId, user1Session.sessionId)).toBe(false);
      
      // User1 can rejoin after ejection
      const canRejoinAfterEject = roomService.addSession(roomId, user1Session);
      expect(canRejoinAfterEject).toBe(true);
      
      // Now ban user1
      roomService.banUser(roomId, user1Session.sessionId);
      expect(roomService.isUserBanned(roomId, user1Session.sessionId)).toBe(true);
      
      // User1 cannot rejoin after ban
      const canRejoinAfterBan = roomService.addSession(roomId, user1Session);
      expect(canRejoinAfterBan).toBe(false);
    });
  });

  describe('Multiple Users Moderation', () => {
    let user3Session: UserSession;

    beforeEach(() => {
      user3Session = {
        sessionId: 'user3-session',
        roomId,
        nickname: 'User3',
        color: '#0000FF',
        joinedAt: Date.now()
      };
      roomService.addSession(roomId, user1Session);
      roomService.addSession(roomId, user2Session);
      roomService.addSession(roomId, user3Session);
    });

    it('should be able to ban multiple users', () => {
      expect(roomService.getParticipantCount(roomId)).toBe(3);
      
      roomService.banUser(roomId, user1Session.sessionId);
      roomService.banUser(roomId, user2Session.sessionId);
      
      expect(roomService.isUserBanned(roomId, user1Session.sessionId)).toBe(true);
      expect(roomService.isUserBanned(roomId, user2Session.sessionId)).toBe(true);
      expect(roomService.isUserBanned(roomId, user3Session.sessionId)).toBe(false);
      expect(roomService.getParticipantCount(roomId)).toBe(1);
    });

    it('should allow ejecting one user while others remain', () => {
      roomService.ejectUser(roomId, user1Session.sessionId);
      
      expect(roomService.getParticipantCount(roomId)).toBe(2);
      expect(roomService.getSession(roomId, user2Session.sessionId)).toBeDefined();
      expect(roomService.getSession(roomId, user3Session.sessionId)).toBeDefined();
    });
  });

  describe('Ban Persistence', () => {
    it('should persist ban across session removal', () => {
      roomService.addSession(roomId, user1Session);
      roomService.banUser(roomId, user1Session.sessionId);
      
      // Remove session manually
      roomService.removeSession(roomId, user1Session.sessionId);
      
      // Ban should still be in effect
      expect(roomService.isUserBanned(roomId, user1Session.sessionId)).toBe(true);
      
      // Cannot rejoin
      const canRejoin = roomService.addSession(roomId, user1Session);
      expect(canRejoin).toBe(false);
    });

    it('should clear bans when room is deleted', () => {
      roomService.addSession(roomId, user1Session);
      roomService.banUser(roomId, user1Session.sessionId);
      
      expect(roomService.isUserBanned(roomId, user1Session.sessionId)).toBe(true);
      
      roomService.deleteRoom(roomId);
      
      // Room no longer exists
      expect(roomService.getRoom(roomId)).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle banning user not currently in room', () => {
      // User not in room
      const banned = roomService.banUser(roomId, user1Session.sessionId);
      expect(banned).toBe(true);
      expect(roomService.isUserBanned(roomId, user1Session.sessionId)).toBe(true);
      
      // Try to add banned user
      const added = roomService.addSession(roomId, user1Session);
      expect(added).toBe(false);
    });

    it('should handle ejecting already ejected user', () => {
      roomService.addSession(roomId, user1Session);
      roomService.ejectUser(roomId, user1Session.sessionId);
      
      // Try to eject again
      const ejected = roomService.ejectUser(roomId, user1Session.sessionId);
      expect(ejected).toBeNull();
    });

    it('should handle banning already banned user', () => {
      roomService.addSession(roomId, user1Session);
      roomService.banUser(roomId, user1Session.sessionId);
      
      // Try to ban again
      const banned = roomService.banUser(roomId, user1Session.sessionId);
      expect(banned).toBe(true); // Should still succeed
      expect(roomService.isUserBanned(roomId, user1Session.sessionId)).toBe(true);
    });
  });
});
