import { suite, it, expect } from 'vitest';
import { parseConfigFileData, bootstrapConfigProcessor, getConfigDefaults, runtimeConfigProcessor } from './configParser';
import { z } from 'zod';
import { SYM_FIXER_DEFAULT, SYM_FIXER_FATAL, typeDefinedConfig, typeNullableConfig, SYM_RESET_CONFIG } from './schema/utils';
import ConfigStore from '.';


suite('parseConfigFileData', () => {
    it('should correctly parse a valid config file', () => {
        const configFileData = {
            version: 1,
            example: {
                serverName: 'MyServer',
                enabled: true,
            },
            server: {
                dataPath: '/path/to/data',
            },
        };
        const result = parseConfigFileData(configFileData);
        expect(result).toEqual([
            { scope: 'example', key: 'serverName', value: 'MyServer' },
            { scope: 'example', key: 'enabled', value: true },
            { scope: 'server', key: 'dataPath', value: '/path/to/data' },
        ]);
    });

    it('should ignore the version key', () => {
        const configFileData = {
            version: 1,
            example: {
                serverName: 'MyServer',
            },
        };
        const result = parseConfigFileData(configFileData);
        expect(result).toEqual([
            { scope: 'example', key: 'serverName', value: 'MyServer' },
        ]);
    });

    it('should handle empty config file', () => {
        const configFileData = {};
        const result = parseConfigFileData(configFileData);
        expect(result).toEqual([]);
    });

    it('should handle nested scopes', () => {
        const configFileData = {
            version: 1,
            example: {
                serverName: 'MyServer',
                enabled: true,
            },
            server: {
                dataPath: { path: '/path/to/data' },
            },
        };
        const result = parseConfigFileData(configFileData as any);
        expect(result).toEqual([
            { scope: 'example', key: 'serverName', value: 'MyServer' },
            { scope: 'example', key: 'enabled', value: true },
            { scope: 'server', key: 'dataPath', value: { path: '/path/to/data' } },
        ]);
    });
});


suite('bootstrapConfigProcessor', () => {
    const allConfigScopes = {
        example: {
            serverName: typeDefinedConfig({
                default: 'change-me',
                validator: z.string().min(1).max(18),
                fixer: SYM_FIXER_DEFAULT,
            }),
            enabled: typeDefinedConfig({
                default: true,
                validator: z.boolean(),
                fixer: SYM_FIXER_DEFAULT,
            }),
        },
        server: {
            dataPath: typeNullableConfig({
                default: null,
                validator: z.string().min(1).nullable(),
                fixer: SYM_FIXER_FATAL,
            }),
        }
    };
    const defaultConfigs = getConfigDefaults(allConfigScopes);

    it('should process valid config items', () => {
        const parsedInput = [
            { scope: 'example', key: 'serverName', value: 'MyServer' },
            { scope: 'server', key: 'dataPath', value: '/path/to/data' },
        ];
        const result = bootstrapConfigProcessor(parsedInput, allConfigScopes, defaultConfigs);
        expect(result.stored.example.serverName).toBe('MyServer');
        expect(result.stored.server.dataPath).toBe('/path/to/data');
        expect(result.active.example.serverName).toBe('MyServer');
        expect(result.active.server.dataPath).toBe('/path/to/data');
    });

    it('should handle unknown config items', () => {
        const parsedInput = [
            { scope: 'unknownScope', key: 'key1', value: 'value1' },
        ];
        const result = bootstrapConfigProcessor(parsedInput, allConfigScopes, defaultConfigs);
        expect(result.unknown.unknownScope.key1).toBe('value1');
    });

    it('should apply default for active but not stored', () => {
        const parsedInput = [
            { scope: 'unknownScope', key: 'key1', value: 'value1' },
        ];
        const result = bootstrapConfigProcessor(parsedInput, allConfigScopes, defaultConfigs);
        expect(result.stored?.example?.serverName).toBeUndefined();
        expect(result.active.example.serverName).toBe(defaultConfigs.example.serverName);
    });

    it('should apply default values for invalid config items', () => {
        const parsedInput = [
            { scope: 'example', key: 'serverName', value: '' },
        ];
        const result = bootstrapConfigProcessor(parsedInput, allConfigScopes, defaultConfigs);
        expect(result.stored.example.serverName).toBe(defaultConfigs.example.serverName);
        expect(result.active.example.serverName).toBe(defaultConfigs.example.serverName);
    });

    it('should throw error for unfixable invalid config items', () => {
        const parsedInput = [
            { scope: 'server', key: 'dataPath', value: '' },
        ];
        expect(() => bootstrapConfigProcessor(parsedInput, allConfigScopes, defaultConfigs)).toThrow();
    });
});


suite('runtimeConfigProcessor', () => {
    const allConfigScopes = {
        example: {
            serverName: typeDefinedConfig({
                default: 'change-me',
                validator: z.string().min(1).max(18),
                fixer: SYM_FIXER_DEFAULT,
            }),
            enabled: typeDefinedConfig({
                default: true,
                validator: z.boolean(),
                fixer: SYM_FIXER_DEFAULT,
            }),
        },
        server: {
            dataPath: typeNullableConfig({
                default: null,
                validator: z.string().min(1).nullable(),
                fixer: SYM_FIXER_FATAL,
            }),
            scheduledRestarts: typeDefinedConfig({
                default: [],
                validator: z.array(z.number().int()).default([]),
                fixer: SYM_FIXER_DEFAULT,
            }),
        },
    };
    const storedConfigs = {
        example: {
            serverName: 'StoredServer',
            enabled: false,
        },
        server: {
            dataPath: '/stored/path',
        }
    };
    const activeConfigs = {
        example: {
            serverName: 'ActiveServer',
            enabled: true,
        },
        server: {
            dataPath: '/active/path',
        }
    };

    it('should process valid config changes', () => {
        const parsedInput = [
            { scope: 'example', key: 'serverName', value: 'NewServer' },
        ];
        const result = runtimeConfigProcessor(parsedInput, allConfigScopes, storedConfigs, activeConfigs);
        expect(result.stored.example.serverName).toBe('NewServer');
        expect(result.active.example.serverName).toBe('NewServer');
        expect(result.active.server.dataPath).toBe('/active/path');
        expect(result.storedKeysChanges).toEqual([{ scope: 'example', key: 'serverName' }]);
        expect(result.activeKeysChanges).toEqual([{ scope: 'example', key: 'serverName' }]);
    });

    it('should reset config to default', () => {
        const parsedInput = [
            { scope: 'example', key: 'serverName', value: SYM_RESET_CONFIG },
        ];
        const result = runtimeConfigProcessor(parsedInput, allConfigScopes, storedConfigs, activeConfigs);
        expect(result.stored.example.serverName).toBeUndefined();
        expect(result.active.example.serverName).toBe('change-me');
        expect(result.storedKeysChanges).toEqual([{ scope: 'example', key: 'serverName' }]);
        expect(result.activeKeysChanges).toEqual([{ scope: 'example', key: 'serverName' }]);
    });

    it('should list the correct changes', () => {
        const parsedInput = [
            { scope: 'example', key: 'serverName', value: 'StoredServer' },
            { scope: 'server', key: 'dataPath', value: '/active/path' },
        ];
        const result = runtimeConfigProcessor(parsedInput, allConfigScopes, storedConfigs, activeConfigs);
        expect(result.storedKeysChanges).toEqual([{ scope: 'server', key: 'dataPath' }]);
        expect(result.activeKeysChanges).toEqual([{ scope: 'example', key: 'serverName' }]);
    });

    it('should throw error for invalid config changes', () => {
        const parsedInput = [
            { scope: 'example', key: 'serverName', value: false },
        ];
        expect(() => runtimeConfigProcessor(parsedInput, allConfigScopes, storedConfigs, activeConfigs)).toThrow();
    });

    it('should handle unknown config items', () => {
        const parsedInput = [
            { scope: 'unknownScope', key: 'key1', value: 'value1' },
        ];
        expect(() => runtimeConfigProcessor(parsedInput, allConfigScopes, storedConfigs, activeConfigs)).toThrow();
    });

    it('should handle default equality checking', () => {
        const parsedInput = [
            { scope: 'server', key: 'scheduledRestarts', value: [] },
        ];
        const result = runtimeConfigProcessor(parsedInput, allConfigScopes, storedConfigs, activeConfigs);
        expect(result.stored.server.scheduledRestarts).toBeUndefined();
        expect(result.active.server.scheduledRestarts).toEqual([]);
    });
});


suite('schema sanity check', () => {
    it('should have the same keys in all schemas', () => {
        for (const [scopeName, scopeConfigs] of Object.entries(ConfigStore.Schema)) {
            for (const [configKey, configData] of Object.entries(scopeConfigs)) {
                expect(configData.default).toBeDefined();
                expect(configData.validator).toBeDefined();
                expect(configData.fixer).toBeDefined();
            }
        }
    });
});
