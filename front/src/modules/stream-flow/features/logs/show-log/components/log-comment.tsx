import { CircleInfoFill, Pencil } from '@gravity-ui/icons';
import {
  Button,
  Disclosure,
  Flex,
  Icon,
  Text,
  TextArea,
  Tooltip,
} from '@gravity-ui/uikit';
import { useUnit } from 'effector-react';
import React, { useEffect, useMemo, useState } from 'react';

import { WhoAmIModel } from '@/modules/stream-flow/entities/user/who-am-i';

interface LogCommentProps {
  userName: string;
  logComment: string;
  onSaveChanges: (comment: string) => void;
  pending: boolean;
}

export const LogComment: React.FC<LogCommentProps> = ({
  userName,
  logComment,
  onSaveChanges,
  pending,
}) => {
  const [user, loadUser] = useUnit([WhoAmIModel.$data, WhoAmIModel.load]);
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState('');
  const [expanded, setExpanded] = React.useState(false);

  useEffect(() => {
    if (!user) loadUser();
  }, [user, loadUser]);

  useEffect(() => {
    if (logComment) {
      setComment(logComment);
    }

    setIsEditing(false);
  }, [logComment]);

  const canEdit = useMemo(() => {
    if (!user) return false;
    return user.name === userName;
  }, [userName, user]);

  return (
    <Flex direction="column" gap={0}>
      <Flex direction="row" gap={4} alignItems="center">
        {logComment !== '' ? (
          <Disclosure
            summary={
              <Text
                variant="body-1"
                color="secondary"
                style={{ userSelect: 'none' }}
              >
                Comment
              </Text>
            }
            arrowPosition="end"
            expanded={expanded}
            onUpdate={setExpanded}
          />
        ) : (
          <Flex direction="row" gap={2}>
            <Text variant="body-1">
              <b>Comment:</b>
            </Text>
            <Text variant="body-1" color="secondary">
              empty
            </Text>
          </Flex>
        )}
        {isEditing ? (
          <Flex direction="row" gap={2}>
            <Button
              view="outlined"
              onClick={() => setIsEditing(false)}
              size="s"
              style={{ width: 'fit-content', flexShrink: 0 }}
              loading={pending}
            >
              Cancel
            </Button>
            <Button
              view="action"
              onClick={() => onSaveChanges(comment)}
              size="s"
              style={{ width: 'fit-content', flexShrink: 0 }}
              loading={pending}
            >
              Save changes
            </Button>
          </Flex>
        ) : canEdit ? (
          <Button
            view="normal"
            onClick={() => {
              setComment(logComment);
              setIsEditing(true);
              setExpanded(true);
            }}
            size="s"
            style={{ width: 'fit-content', flexShrink: 0 }}
          >
            <Button.Icon>
              <Pencil />
            </Button.Icon>
            Edit
          </Button>
        ) : (
          <Tooltip
            content="You can edit the comment only for your own action"
            openDelay={0}
            placement="right"
          >
            <Icon data={CircleInfoFill} />
          </Tooltip>
        )}
      </Flex>
      {expanded ? (
        isEditing ? (
          <TextArea
            style={{ marginTop: '10px' }}
            hasClear
            minRows={10}
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
            }}
            placeholder="Enter new comment"
          />
        ) : (
          <Flex
            style={{
              maxHeight: '200px',
              overflow: 'auto',
              width: '100%',
              marginTop: '6px',
            }}
          >
            <Text
              variant="body-1"
              style={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
              }}
            >
              {logComment}
            </Text>
          </Flex>
        )
      ) : null}
    </Flex>
  );
};
