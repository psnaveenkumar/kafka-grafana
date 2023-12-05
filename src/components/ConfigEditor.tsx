import React, { ChangeEvent, useState } from 'react';
//import { InlineField, Input, SecretInput } from '@grafana/ui';
//import { DataSourcePluginOptionsEditorProps } from '@grafana/data';


import {
  InlineField,
  Input,
  FieldSet,
  InlineSwitch,
  SecretInput
} from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions, MySecureJsonData } from '../types';

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions> { }

export function ConfigEditor(props: Props) {
  const { onOptionsChange, options } = props;
  const [usemTls, setUsemTLS] = useState(false);
  const { jsonData, secureJsonFields } = options;
  const secureJsonData = (options.secureJsonData || {}) as MySecureJsonData;

  const onBootstrapServersChange = (event: ChangeEvent<HTMLInputElement>) => {
    const jsonData = {
      ...options.jsonData,
      bootstrapServers: event.target.value,
    }
    onOptionsChange({ ...options, jsonData });
  }

  const onUseMTLSChange = (event: ChangeEvent<HTMLInputElement>) => {
    const val = !usemTls;
    setUsemTLS(val);
    const jsonData = {
      ...options.jsonData,
      usemTLS: val,
    }
    onOptionsChange({ ...options, jsonData });
  }

  const onMTLSPrivateKeyPathChange = (event: ChangeEvent<HTMLInputElement>) => {

    const jsonData = {
      ...options.jsonData,
      mtlsPrivateKeyPath: event.target.value,
    }
    onOptionsChange({ ...options, jsonData });
  }

  const onMTLSPublicKeyPathChange = (event: ChangeEvent<HTMLInputElement>) => {
    const jsonData = {
      ...options.jsonData,
      mtlsPublicKeyPath: event.target.value,
    }
    onOptionsChange({ ...options, jsonData });
  }

  const onMTLSKeyPasswordChange = (event: ChangeEvent<HTMLInputElement>) => {
    onOptionsChange({
      ...options,
      secureJsonData: {
        mtlsKeyPassword: event.target.value,
      },
    });
  }

  const onResetMTLSKeyPassword = () => {
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        mtlsKeyPassword: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        mtlsKeyPassword: '',
      },
    });
  }

  return (
    <div className="gf-form-group">
      <FieldSet label="General">
        <InlineField label="Servers" labelWidth={18}>
          <Input
            onChange={onBootstrapServersChange}
            value={jsonData.bootstrapServers || ''}
            placeholder="broker1:9092, broker2:9092"
            width={40}
          />
        </InlineField>
      </FieldSet>
      <FieldSet label="Auth">
        <InlineField label="Use mTLS" labelWidth={18}>
          <InlineSwitch disabled={!usemTls} onChange={onUseMTLSChange}></InlineSwitch>
        </InlineField>
        {usemTls && (
          <>
            <InlineField label="Public Key Location" labelWidth={18}>
              <Input
                onChange={onMTLSPublicKeyPathChange}
                value={jsonData.mtlsPublicKeyPath || ''}
                placeholder="/path/to/public-key.pem"
                width={40}
              />
            </InlineField>
            <InlineField label="Private Key Location" labelWidth={18}>
              <Input
                onChange={onMTLSPrivateKeyPathChange}
                value={jsonData.mtlsPrivateKeyPath || ''}
                placeholder="/path/to/private-key.pem"
                width={40}
              />
            </InlineField>
            <InlineField label="Key Password" labelWidth={18}>
              <SecretInput
                isConfigured={(secureJsonFields && secureJsonFields.apiKey) as boolean}
                onReset={onResetMTLSKeyPassword}
                onChange={onMTLSKeyPasswordChange}
                value={secureJsonData.mtlsKeyPassword || ''}
                placeholder="key password (if any)"
                width={40}
              />
            </InlineField>
          </>
        )}
      </FieldSet>

    </div>
  );
}
