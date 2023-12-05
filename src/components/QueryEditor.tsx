import { defaults } from 'lodash';
import React, { ChangeEvent, SyntheticEvent } from 'react';
import { InlineFormLabel, InlineFieldRow, Select, Switch } from '@grafana/ui';
import {
  QueryEditorProps,
  SelectableValue
} from '@grafana/data';
import { DataSource } from '../datasource';
import { defaultQuery, AutoOffsetReset, TimestampMode, MyQuery, MyDataSourceOptions } from '../types';

const autoResetOffsets = [
  {
    label: 'From the last 100',
    value: AutoOffsetReset.EARLIEST,
    description: 'Consume from the last 100 offset',
  },
  {
    label: 'Latest',
    value: AutoOffsetReset.LATEST,
    description: 'Consume from the latest offset',
  },
] as Array<SelectableValue<AutoOffsetReset>>;

const timestampModes = [
  {
    label: 'Now',
    value: TimestampMode.Now,
    description: 'Current time while consuming the message',
  },
  {
    label: 'Message Timestamp',
    value: TimestampMode.Message,
    description: 'The message timestamp while producing into topic',
  },
] as Array<SelectableValue<TimestampMode>>;

type Props = QueryEditorProps<DataSource, MyQuery, MyDataSourceOptions, MyQuery>;

export function QueryEditor(props: Props) {
  const onTopicNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = props;
    onChange({ ...query, topicName: event.target.value });
    onRunQuery();
  };

  const onPartitionChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = props;
    onChange({ ...query, partition: parseFloat(event.target.value) });
    onRunQuery();
  };

  const onWithStreamingChange = (event: SyntheticEvent<HTMLInputElement>) => {
    const { onChange, query, onRunQuery } = props;
    onChange({ ...query, withStreaming: event.currentTarget.checked });
    onRunQuery();
  };

  const onAutoResetOffsetChanged = (selected: SelectableValue<AutoOffsetReset>) => {
    const { onChange, query, onRunQuery } = props;
    onChange({ ...query, autoOffsetReset: selected.value || AutoOffsetReset.LATEST });
    onRunQuery();
  };

  const resolveAutoResetOffset = (value: string | undefined) => {
    if (value === AutoOffsetReset.LATEST) {
      return autoResetOffsets[1];
    }
    return autoResetOffsets[0];
  };

  const onTimestampModeChanged = (selected: SelectableValue<TimestampMode>) => {
    const { onChange, query, onRunQuery } = props;
    onChange({ ...query, timestampMode: selected.value || TimestampMode.Now });
    onRunQuery();
  };

  const resolveTimestampMode = (value: string | undefined) => {
    if (value === TimestampMode.Now) {
      return timestampModes[0];
    }
    return timestampModes[1];
  };

  const query = defaults(props.query, defaultQuery);
  const { topicName, partition, withStreaming, autoOffsetReset, timestampMode } = query;

  return (
    <>
      <div className="gf-form">
        <InlineFieldRow>
          <InlineFormLabel width={10}>Topic</InlineFormLabel>
          <input
            className="gf-form-input width-14"
            value={topicName || ''}
            onChange={onTopicNameChange}
            type="text"
          />
          <InlineFormLabel width={10}>Partition</InlineFormLabel>
          <input
            className="gf-form-input width-14"
            value={partition}
            onChange={onPartitionChange}
            type="number"
            step="1"
            min="0"
          />
          <InlineFormLabel>
            Enable streaming <small>(v8+)</small>
          </InlineFormLabel>
          <div className="add-data-source-item-badge">
            <Switch checked={withStreaming || false} onChange={onWithStreamingChange} />
          </div>
        </InlineFieldRow>
      </div>
      <div className="gf-form">
        <InlineFieldRow>
          <InlineFormLabel
            className="width-5"
            tooltip="Starting offset to consume that can be from latest or last 100."
          >
            Auto offset reset
          </InlineFormLabel>
          <div className="gf-form--has-input-icon">
            <Select
              className="width-14"
              value={resolveAutoResetOffset(autoOffsetReset)}
              options={autoResetOffsets}
              defaultValue={autoResetOffsets[0]}
              onChange={onAutoResetOffsetChanged}
            />
          </div>
          <InlineFormLabel tooltip="Timestamp of the kafka value to visualize.">Timestamp Mode</InlineFormLabel>
          <div className="gf-form--has-input-icon">
            <Select
              className="width-14"
              value={resolveTimestampMode(timestampMode)}
              options={timestampModes}
              defaultValue={timestampModes[0]}
              onChange={onTimestampModeChanged}
            />
          </div>
        </InlineFieldRow>
      </div>
    </>
  );
}
