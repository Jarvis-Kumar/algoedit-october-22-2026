
import React from 'react';
import { motion } from 'motion/react';
import { CollaboratorPresence } from '../types';
import { MousePointer2 } from 'lucide-react';

interface LiveCursorsProps {
  collaborators: CollaboratorPresence[];
}

const LiveCursors: React.FC<LiveCursorsProps> = ({ collaborators }) => {
  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      {collaborators.map((collaborator) => (
        <motion.div
          key={collaborator.userId}
          initial={false}
          animate={{
            x: collaborator.cursor.x,
            y: collaborator.cursor.y,
          }}
          transition={{
            type: 'spring',
            damping: 30,
            mass: 0.8,
            stiffness: 350,
          }}
          className="absolute left-0 top-0"
        >
          <MousePointer2
            size={24}
            style={{
              fill: collaborator.color,
              color: collaborator.color,
              transform: 'rotate(-90deg)',
            }}
          />
          <div
            className="ml-4 mt-2 px-2 py-1 rounded-md text-[10px] font-bold text-white shadow-lg whitespace-nowrap"
            style={{ backgroundColor: collaborator.color }}
          >
            {collaborator.userName}
            {collaborator.activeElementId && (
              <span className="ml-1 opacity-70 font-medium">
                • editing {collaborator.activeElementId}
              </span>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default LiveCursors;
