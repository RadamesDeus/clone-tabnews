require( 'dotenv' ).config( { path: '.env.development' } );
const nextJest = require( 'next/jest' );

/** @type {import('jest').Config} */
const config = {
  moduleDirectories: [ 'node_modules', '<rootDir>' ],
};

const createJestConfig = nextJest();
const jestConfig = createJestConfig( config );
module.exports = jestConfig;
