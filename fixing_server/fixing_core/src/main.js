/* eslint-disable prefer-template */
import { parse, print } from 'recast';
import { transformFromAstSync, parseSync } from '@babel/core';
import path from 'path';
import { LeakFactorStats } from '../LeakFactorStats';
import mainPlugin from './PatchGenerator/mainPlugin';

export default function jsCodeShift(file, api, options) {
  const transformedSource = babelRecast(file.source, file.path, options);
  return transformedSource;
}

const fontStyle = {
  reset: '\x1b[0m',
  underscore: '\x1b[4m',
  red: '\x1b[31m',
};

export function babelRecast(code, filePath, options) {
  const fileName = filePath.replace(filePath.split(options.folderName)[0], '');
  const fileExtension = path.extname(filePath);

  try {
    const ast = parse(code, {
      parser: {
        parse: (source) => parseSync(source, {
          presets: [
            require('@babel/preset-env').default,
            require('@babel/preset-react').default,
            [require('@babel/preset-flow').default, { allowDeclareFields: true }],
            [require('@babel/preset-typescript').default, { allowDeclareFields: true }]
          ],
          overrides: [
            {
              plugins: [
                [require('@babel/plugin-proposal-decorators').default, { legacy: true }],
                [require('@babel/plugin-transform-typescript').default, { isTSX: true, allExtensions: true, allowDeclareFields: true }],
                [require('@babel/plugin-transform-flow-strip-types').default, { allowDeclareFields: true }]
              ]
            }
          ],
          filename: filePath, // this defines the loader depending on the extension
          parserOpts: {
              tokens: true, // recast uses this
              allowReturnOutsideFunction: true,
              errorRecovery: true
          },
        })
      },
    });

    const options = {
      cloneInputAst: false,
      code: false,
      ast: true,
      configFile: false,
      plugins: [[mainPlugin, { fileName, fileExtension }]]
    };

    const { ast: transformedAST } = transformFromAstSync(ast, code, options);
    const result = print(transformedAST).code;
    return result;
  } catch (error) {
    LeakFactorStats.removeFileFromRefactoredFiles(fileName);
    console.log(fontStyle.underscore, fontStyle.red, '\nFile parsing error', fontStyle.reset);
    console.log(fontStyle.red + 'Type:', error.code);
    console.log('Reason:', error.reasonCode);
    console.log('File name', fileName);
    console.log('Details:', error.toString().split(/.+(?=\s+at )/)[0], fontStyle.reset);
    // console.log(error);
    console.log('\n');
  }

  return code;
}
