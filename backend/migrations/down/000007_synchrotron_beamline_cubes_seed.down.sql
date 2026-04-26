-- Удаляет только кубы, добавленные сидом 000007 (author = system, фиксированные имена).
DELETE FROM t_cubes
WHERE author = 'system'
  AND name IN (
    'SkifSynchrotronMonochromator',
    'SkifSynchrotronSlit',
    'SkifSynchrotronMirror',
    'SkifSynchrotronFocusingMirror',
    'SkifSynchrotronCollimator',
    'SkifSynchrotronAttenuator',
    'SkifSynchrotronShutter',
    'SkifSynchrotronFilter',
    'SkifSynchrotronSampleStage',
    'SkifSynchrotronDetector',
    'SkifSynchrotronDrift'
  );
